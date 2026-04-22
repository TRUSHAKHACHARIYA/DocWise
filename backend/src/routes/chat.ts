import { FastifyInstance, FastifyRequest } from 'fastify';
import { Plan, Role } from "@prisma/client";

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: Role;
      plan: Plan;
      trialEndsAt?: Date | null;
    };
  }
}

import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireVerified } from '../middleware/auth';
import { retrieveRelevantChunks } from '../services/retriever';
import { buildPrompt, getStreamingLLMResponse } from '../services/llm';
import { checkQuestionLimit } from '../middleware/usageLimits';
import { incrementUsage } from '../services/usage';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export async function chatRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireVerified);

  // Get all chat sessions
  app.get('/', async (req, reply) => {
    const userId = req.user!.id;
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // latest message
        }
      }
    });
    return reply.send({ sessions });
  });

  // Create new session
  app.post('/', async (req, reply) => {
    const userId = req.user!.id;
    const { documentIds, title } = z.object({
      documentIds: z.array(z.string()).optional(),
      title: z.string().optional()
    }).parse(req.body);

    const session = await prisma.chatSession.create({
      data: {
        userId,
        title: title || 'New Chat',
      }
    });

    if (documentIds && documentIds.length > 0) {
      await prisma.chatSessionDoc.createMany({
        data: documentIds.map(docId => ({
          sessionId: session.id,
          documentId: docId
        }))
      });
    }

    return reply.send({ session });
  });

  // Get single session with messages
  app.get('/:sessionId', async (req, reply) => {
    const userId = req.user!.id;
    const { sessionId } = req.params as { sessionId: string };

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        documents: {
          include: { document: true }
        }
      }
    });

    if (!session) return reply.code(404).send({ error: 'Session not found' });
    return reply.send({ session });
  });

  // Update session documents
  app.patch('/:sessionId/documents', async (req, reply) => {
    const userId = req.user!.id;
    const { sessionId } = req.params as { sessionId: string };
    const { documentIds } = z.object({
      documentIds: z.array(z.string())
    }).parse(req.body);

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) return reply.code(404).send({ error: 'Session not found' });

    // Replace documents for the session
    await prisma.chatSessionDoc.deleteMany({
      where: { sessionId }
    });

    if (documentIds.length > 0) {
      await prisma.chatSessionDoc.createMany({
        data: documentIds.map(docId => ({
          sessionId,
          documentId: docId
        }))
      });
    }

    return reply.send({ success: true, documentIds });
  });

  // Send message and stream response (SSE)
  app.post('/:sessionId/message', { preHandler: [checkQuestionLimit] }, async (req, reply) => {
    const userId = req.user!.id;
    const { sessionId } = req.params as { sessionId: string };
    const { content: rawContent } = z.object({ 
      content: z.string().min(1).max(4000).trim() 
    }).parse(req.body);

    const content = DOMPurify.sanitize(rawContent);

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        documents: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) return reply.code(404).send({ error: 'Session not found' });

    // Save user message to DB
    await prisma.message.create({
      data: {
        sessionId,
        role: 'USER',
        content,
      }
    });

    // Determine document constraints
    const documentIds = session.documents.map(d => d.documentId);

    // Retrieve chunks
    const chunks = await retrieveRelevantChunks(
      userId,
      content,
      5,
      documentIds.length > 0 ? documentIds : undefined
    );

    // Setup history for Claude (only actual history, not this new message)
    const history = session.messages.map(msg => ({
      role: msg.role === 'USER' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Build prompt
    const systemPrompt = "You are DocWise, an intelligent assistant. Only use the provided context to answer questions.";
    const { messages } = await buildPrompt(systemPrompt, history, content, chunks);

    // Set up SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    
    // Send sources first as metadata
    const formattedSources = chunks.map(chunk => ({
      title: chunk.documentName,
      excerpt: chunk.text,
      page: chunk.page,
      documentId: chunk.documentId
    }));
    reply.raw.write(`data: ${JSON.stringify({ sources: formattedSources })}\n\n`);

    try {
      // Use the service to handle streaming and get the full response
      const fullAssistantContent = await getStreamingLLMResponse(systemPrompt, messages, reply);

      // Save assistant response to DB
      await prisma.message.create({
        data: {
          sessionId,
          role: 'ASSISTANT',
          content: fullAssistantContent,
          sources: JSON.stringify(chunks)
        }
      });

      // Increment question usage
      await incrementUsage(userId, 'questionsUsed');
 
      if (!reply.raw.writableEnded) {
        reply.raw.write('data: [DONE]\n\n');
        reply.raw.end();
      }
    } catch (err) {
      app.log.error(err);
      if (!reply.raw.writableEnded) {
        reply.raw.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
        reply.raw.end();
      }
    }
  });

  // NEW: Message Feedback (Thumbs Up/Down)
  app.post('/:sessionId/messages/:messageId/feedback', async (req, reply) => {
    const userId = req.user!.id;
    const { sessionId, messageId } = req.params as { sessionId: string; messageId: string };
    const { isPositive, comment } = z.object({
      isPositive: z.boolean(),
      comment: z.string().optional()
    }).parse(req.body);

    const message = await prisma.message.findFirst({
      where: { 
        id: messageId, 
        sessionId,
        session: { userId } 
      }
    });

    if (!message) {
      return reply.code(404).send({ error: 'Message not found' });
    }

    const feedback = await prisma.messageFeedback.upsert({
      where: { messageId },
      update: { isPositive, comment },
      create: {
        messageId,
        isPositive,
        comment
      }
    });

    return reply.send({ success: true, feedback });
  });

  // Rename session
  app.patch('/:sessionId', async (req, reply) => {
    const userId = req.user!.id;
    const { sessionId } = req.params as { sessionId: string };
    const { title } = z.object({
      title: z.string().min(1).max(100).trim()
    }).parse(req.body);

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) return reply.code(404).send({ error: 'Session not found' });

    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title }
    });

    return reply.send({ session: updatedSession });
  });

  // Delete session
  app.delete('/:sessionId', async (req, reply) => {
    const userId = req.user!.id;
    const { sessionId } = req.params as { sessionId: string };

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) return reply.code(404).send({ error: 'Session not found' });

    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    return reply.send({ success: true });
  });
}
