import { queryVectors, VectorMetadata } from './vectorStore';
import { embedQuery } from './embedder';
import { rerankChunks } from './reranker';
import { prisma } from '../utils/prisma';

export interface RetrievedChunk {
  text: string;
  documentId: string;
  documentName: string;
  score: number;
  page?: number;
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

  // 2. Query Pinecone (get slightly more chunks for reranking)
  const queryTopK = documentIds?.length ? topK * 3 : 20; 
  const matches = await queryVectors(userId, questionEmbedding, queryTopK, documentIds);

  if (matches.length === 0) return [];

  // 3. Fetch document names for titles
  const foundDocIds = Array.from(new Set(matches.map(m => (m.metadata as VectorMetadata).documentId)));
  const docs = await prisma.document.findMany({
    where: { id: { in: foundDocIds } },
    select: { id: true, name: true }
  });
  const docMap = new Map(docs.map(d => [d.id, d.name]));

  // 4. Format results
  const initialChunks: RetrievedChunk[] = matches.map((match) => {
    const metadata = match.metadata as VectorMetadata;
    return {
      text: metadata.text,
      documentId: metadata.documentId,
      documentName: docMap.get(metadata.documentId) || 'Unknown Document',
      score: match.score || 0,
      page: metadata.pageNumber, // Include if present in metadata
    };
  });

  // 5. Rerank results with Cohere
  return await rerankChunks(question, initialChunks, topK);
}
