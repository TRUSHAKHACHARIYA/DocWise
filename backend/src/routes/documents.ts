import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { uploadFile, getFileUrl, deleteFile } from '../services/fileStorage';
import { requireVerified } from '../middleware/auth';
import { extractText } from '../services/parser';
import { chunkText } from '../services/chunker';
import { embedChunks } from '../services/embedder';
import { upsertVectors, deleteVectorsByDocumentId } from '../services/vectorStore';
import { checkDocumentLimit } from '../middleware/usageLimits';
import { incrementUsage } from '../services/usage';
import { looksSuspiciousTextPayload, validateUploadMimeType, validateUploadSignature } from '../utils/uploadSecurity';

export async function documentRoutes(app: FastifyInstance) {
  app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    }
  });

  app.addHook('preHandler', requireVerified);
  
  app.post('/upload', { preHandler: [checkDocumentLimit] }, async (req, reply) => {
    const data = await req.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const userId = req.user!.id;
    const buffer = await data.toBuffer();
    const sizeBytes = buffer.length;

    if (!validateUploadMimeType(data.mimetype)) {
      return reply.code(400).send({ error: "Unsupported file type" });
    }

    if (!validateUploadSignature(buffer, data.mimetype)) {
      return reply.code(400).send({ error: "File signature does not match declared MIME type" });
    }

    if (looksSuspiciousTextPayload(buffer, data.mimetype)) {
      return reply.code(400).send({ error: "Potentially unsafe text payload detected" });
    }

    try {
      // 1. Upload to S3/R2
      const { key } = await uploadFile(buffer, data.mimetype, data.filename, userId);

      // 2. Create database record
      const document = await prisma.document.create({
        data: {
          userId,
          name: data.filename,
          s3Key: key,
          sizeBytes,
          mimeType: data.mimetype,
          status: 'PROCESSING', // Will be picked up by worker or sync processing
        }
      });

      // We run pipeline synchronously for MVP
      try {
        const { text, pageCount } = await extractText(buffer, data.mimetype, data.filename);
        const chunks = chunkText(text);

        if (chunks.length > 0) {
          const chunkTexts = chunks.map(c => c.text);
          const embeddings = await embedChunks(chunkTexts);

          const vectors = chunks.map((chunk, idx) => ({
            id: `${document.id}_chunk_${idx}`,
            values: embeddings[idx],
            metadata: {
              documentId: document.id,
              userId,
              text: chunk.text,
              startIndex: chunk.startIndex,
            }
          }));

          // Namespace per tenant (userId)
          await upsertVectors(userId, vectors);

          // Update DB record
          await prisma.document.update({
            where: { id: document.id },
            data: { 
              status: 'READY',
              chunkCount: chunks.length,
              pageCount: pageCount || 0
            }
          });
        } else {
          await prisma.document.update({
            where: { id: document.id },
            data: { status: 'READY', chunkCount: 0 }
          });
        }
      } catch (ingestionError) {
        app.log.error(ingestionError);
        await prisma.document.update({
          where: { id: document.id },
          data: { status: 'FAILED' }
        });
      }
      
      // Increment document usage
      await incrementUsage(userId, 'docsUploaded');

      return reply.code(201).send({ document });
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ error: 'File upload failed' });
    }
  });

  app.get('/', async (req, reply) => {
    const userId = req.user!.id;
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return reply.send({ documents });
  });

  app.delete('/:id', async (req, reply) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };

    const document = await prisma.document.findFirst({
      where: { id, userId }
    });

    if (!document) {
      return reply.code(404).send({ error: 'Document not found' });
    }

    try {
      // 1. Delete from S3/R2
      await deleteFile(document.s3Key);
      
      // 2. Delete vectors from Pinecone
      await deleteVectorsByDocumentId(userId, document.id);

      // 3. Delete from DB (cascade deletes chunks if added)
      await prisma.document.delete({ where: { id } });

      return reply.send({ message: 'Document deleted successfully' });
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete document' });
    }
  });
}
