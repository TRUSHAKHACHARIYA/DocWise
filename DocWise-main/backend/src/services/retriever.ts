import { queryVectors, VectorMetadata } from './vectorStore';
import { embedQuery } from './embedder';
import { rerankChunks } from './reranker';
import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

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

  // 3. Query Database (Full-Text Search)
  let keywordMatches: {id: string, text: string, documentId: string, startIndex: number, pageNumber: number | null, rank: number}[];
  
  if (documentIds && documentIds.length > 0) {
    keywordMatches = await prisma.$queryRaw`
      SELECT id, text, "documentId", "startIndex", "pageNumber",
             ts_rank("textSearch", plainto_tsquery('english', ${question})) AS rank
      FROM "Chunk"
      WHERE "userId" = ${userId}
        AND "textSearch" @@ plainto_tsquery('english', ${question})
        AND "documentId" IN (${Prisma.join(documentIds)})
      ORDER BY rank DESC
      LIMIT 10
    `;
  } else {
    keywordMatches = await prisma.$queryRaw`
      SELECT id, text, "documentId", "startIndex", "pageNumber",
             ts_rank("textSearch", plainto_tsquery('english', ${question})) AS rank
      FROM "Chunk"
      WHERE "userId" = ${userId}
        AND "textSearch" @@ plainto_tsquery('english', ${question})
      ORDER BY rank DESC
      LIMIT 10
    `;
  }

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
        score: km.rank || 0.5,
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

  // 6. Diversification & Pruning (Essential for Multi-Doc Chat)
  let prunedChunks = initialChunks;
  if (documentIds && documentIds.length > 2) {
    // If many docs are selected, ensure we don't over-saturate with one doc
    const perDocLimit = documentIds.length > 5 ? 2 : 3;
    const docCounts: Record<string, number> = {};
    
    // Sort by score first to keep the best ones
    prunedChunks = initialChunks
      .sort((a, b) => b.score - a.score)
      .filter(chunk => {
        docCounts[chunk.documentId] = (docCounts[chunk.documentId] || 0) + 1;
        return docCounts[chunk.documentId] <= perDocLimit;
      });
  }

  // 7. Rerank results with Cohere (Essential for Hybrid Search)
  return await rerankChunks(question, prunedChunks, topK);
}
