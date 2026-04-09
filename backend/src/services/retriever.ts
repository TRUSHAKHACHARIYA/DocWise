import { embedQuery } from './embedder';
import { queryVectors } from './vectorStore';

export interface RetrievedChunk {
  text: string;
  documentId: string;
  score?: number;
}

export async function retrieveRelevantChunks(userId: string, query: string, documentIds?: string[], topK = 5): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedQuery(query);
  const matches = await queryVectors(userId, queryEmbedding, topK, documentIds);

  return matches.map(match => ({
    text: (match.metadata?.text as string) || "",
    documentId: (match.metadata?.documentId as string) || "",
    score: match.score,
  }));
}
