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

  // 2. Query Pinecone (Vector Search)
  const queryTopK = documentIds?.length ? topK * 3 : 20; 
  const vectorMatches = await queryVectors(userId, questionEmbedding, queryTopK, documentIds);

  // 3. Query Database (Keyword Search)
  const keywordMatches = await prisma.chunk.findMany({
    where: {
      userId,
      documentId: documentIds?.length ? { in: documentIds } : undefined,
      text: { contains: question } // Basic keyword matching
    },
    take: 10,
    select: { id: true, text: true, documentId: true, startIndex: true, pageNumber: true }
  });

  // 4. Merge results and deduplicate
  // We prioritize vector search but include keyword matches if they are unique
  const initialChunks: RetrievedChunk[] = vectorMatches.map((match) => {
    const metadata = match.metadata as VectorMetadata;
    return {
      text: metadata.text,
      documentId: metadata.documentId,
      documentName: '...', // Placeholder until we fetch names
      score: match.score || 0,
      page: metadata.pageNumber,
    };
  });

  // Add keyword matches that aren't already represented in vector results
  keywordMatches.forEach(km => {
    const exists = initialChunks.some(c => c.documentId === km.documentId && c.text.includes(km.text.substring(0, 50)));
    if (!exists) {
      initialChunks.push({
        text: km.text,
        documentId: km.documentId,
        documentName: '...',
        score: 0.5, // Arbitrary base score for keyword matches before reranking
        page: km.pageNumber || undefined,
      });
    }
  });

  if (initialChunks.length === 0) return [];

  // 5. Fetch document names for titles
  const foundDocIds = Array.from(new Set(initialChunks.map(c => c.documentId)));
  const docs = await prisma.document.findMany({
    where: { id: { in: foundDocIds } },
    select: { id: true, name: true }
  });
  const docMap = new Map(docs.map(d => [d.id, d.name]));
  
  initialChunks.forEach(c => {
    c.documentName = docMap.get(c.documentId) || 'Unknown Document';
  });

  // 6. Rerank results with Cohere (Essential for Hybrid Search)
  return await rerankChunks(question, initialChunks, topK);
}
