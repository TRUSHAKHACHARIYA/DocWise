import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { RetrievedChunk } from './retriever';
import { FastifyReply } from 'fastify';

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export async function buildPrompt(systemPrompt: string, history: any[], newQuery: string, sourceChunks: RetrievedChunk[]): Promise<any> {
  const contextText = sourceChunks.map((chunk, i) => `[Source ${i + 1}]:\n${chunk.text}`).join('\n\n');

  const finalQuery = `Use the following documents to answer the question. If you don't know the answer, say "I don't have enough information to answer that." Keep it concise.

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
) {
  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620', // or appropriate generic model name
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
    stream: true,
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      reply.raw.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
    }
  }

  reply.raw.write('data: [DONE]\n\n');
  reply.raw.end();
}
