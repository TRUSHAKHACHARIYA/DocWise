import { embedQuery } from './embedder';
import { queryVectors } from './vectorStore';
import { rerankChunks } from './reranker';

export interface RetrievedChunk {
  text: string;
  documentId: string;
  score?: number;
}

export async function retrieveRelevantChunks(userId: string, query: string, documentIds?: string[], topK = 5): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedQuery(query);
  
  // Retrieve a larger candidate pool for reranking
  const candidatePoolSize = Math.max(topK * 3, 10);
  const matches = await queryVectors(userId, queryEmbedding, candidatePoolSize, documentIds);

  const candidateChunks = matches.map(match => ({
    text: (match.metadata?.text as string) || "",
    documentId: (match.metadata?.documentId as string) || "",
    score: match.score,
  }));

  // Map Pinecone results through Cohere reranker
  const finalChunks = await rerankChunks(query, candidateChunks, topK);

  return finalChunks;
}
