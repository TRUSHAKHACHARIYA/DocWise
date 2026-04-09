import OpenAI from 'openai';
import { env } from '../config/env';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunks,
  });

  return result.data.map(d => d.embedding);
}

export async function embedQuery(query: string): Promise<number[]> {
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  return result.data[0].embedding;
}
