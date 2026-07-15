import { CohereClient } from 'cohere-ai';
import { RetrievedChunk } from './retriever';
import { logger } from '../utils/logger';

export async function rerankChunks(query: string, chunks: RetrievedChunk[], topN: number = 5): Promise<RetrievedChunk[]> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey || chunks.length === 0) {
    return chunks.slice(0, topN);
  }

  const cohere = new CohereClient({
    token: apiKey,
  });

  try {
    const documents = chunks.map(chunk => chunk.text);

    const response = await cohere.rerank({
      query,
      documents,
      model: 'rerank-english-v3.0',
      topN: Math.min(topN, chunks.length),
    });

    const rerankedChunks: RetrievedChunk[] = response.results.map(result => {
      const originalChunk = chunks[result.index];
      return {
        ...originalChunk,
        score: result.relevanceScore,
      };
    });

    return rerankedChunks;
  } catch (error) {
    logger.error('Cohere reranking failed, falling back to original chunks', { error: (error as Error).message });
    return chunks.slice(0, topN);
  }
}
