import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { RetrievedChunk } from './retriever';
import { FastifyReply } from 'fastify';

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export async function buildPrompt(
  systemPrompt: string,
  history: any[],
  newQuery: string,
  sourceChunks: RetrievedChunk[],
  sourceOnly = false
): Promise<any> {
  const contextText = sourceChunks.map((chunk, i) => `[Source ${i + 1}]:\n${chunk.text}`).join('\n\n');

  const groundingRule = sourceOnly
    ? 'Answer ONLY using the CONTEXT below. If the answer is not contained in the context, respond exactly: "I don\'t have enough information in the provided documents to answer that." Do not use outside knowledge. Prefer short quotes from the sources.'
    : 'If you don\'t know the answer from the context, say "I don\'t have enough information to answer that."';

  const finalQuery = `Use the following documents to answer the question. ${groundingRule} Keep it concise.

CONTEXT:
${contextText}

QUESTION: ${newQuery}`;

  const messages = [...history, { role: 'user', content: finalQuery }];
  return { systemPrompt, messages };
}

export async function getStreamingLLMResponse(
  systemPrompt: string,
  messages: any[],
  reply: FastifyReply
): Promise<string> {
  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
    stream: true,
  });

  let fullContent = '';

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      const text = chunk.delta.text;
      fullContent += text;
      reply.raw.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
  }
  
  return fullContent;
}

export async function getSimpleLLMResponse(
  systemPrompt: string,
  messages: any[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
