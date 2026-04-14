import { queryVectors, VectorMetadata } from './vectorStore';
import { embedQuery } from './embedder';

export interface RetrievedChunk {
  text: string;
  documentId: string;
  score: number;
}

/**
 * Given a user question and a namespace (userId), 
 * returns the most relevant text chunks from the indexed documents.
 */
export async function retrieveRelevantChunks(
  userId: string, 
  question: string, 
  topK = 5,
  documentIds?: string[]
): Promise<RetrievedChunk[]> {
  // 1. Convert question to embedding
  const questionEmbedding = await embedQuery(question);

  // 2. Query Pinecone
  const matches = await queryVectors(userId, questionEmbedding, topK, documentIds);

  // 3. Format results
  return matches.map((match) => {
    const metadata = match.metadata as VectorMetadata;
    return {
      text: metadata.text,
      documentId: metadata.documentId,
      score: match.score || 0,
    };
  });
}
