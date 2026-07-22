import { queryVectors, VectorMetadata } from './vectorStore';
import { embedQuery } from './embedder';
import { rerankChunks } from './reranker';
import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

export type SearchMode = 'semantic' | 'keyword' | 'hybrid';

export interface RetrievedChunk {
  text: string;
  documentId: string;
  documentName: string;
  score: number;
  page?: number;
  createdAt?: Date;
}

export interface RetrieveFilters {
  documentId?: string[];
  uploadedAfter?: string;
  uploadedBefore?: string;
}

function buildPineconeFilter(filters?: RetrieveFilters): Record<string, any> | undefined {
  if (!filters) return undefined;
  const conditions: Record<string, any>[] = [];

  if (filters.documentId && filters.documentId.length > 0) {
    conditions.push({ documentId: { "$in": filters.documentId } });
  }
  if (filters.uploadedAfter) {
    conditions.push({ createdAt: { "$gte": filters.uploadedAfter } });
  }
  if (filters.uploadedBefore) {
    conditions.push({ createdAt: { "$lte": filters.uploadedBefore } });
  }

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return { "$and": conditions };
}

/**
 * Given a user question and a namespace (userId),
 * returns the most relevant text chunks from the indexed documents.
 */
export async function retrieveRelevantChunks(
  userId: string,
  question: string,
  topK = 5,
  documentIds?: string[],
  searchMode: SearchMode = 'hybrid',
  recencyBias: number = 0,
  filters?: RetrieveFilters,
): Promise<RetrievedChunk[]> {
  // 1. Convert question to embedding
  const questionEmbedding = await embedQuery(question);

  // 2. Build Pinecone filter from documentIds + explicit filters
  const pineconeFilter = buildPineconeFilter({
    ...filters,
    documentId: filters?.documentId ?? documentIds,
  });

  // 3. Vector search (skip if keyword-only mode)
  let vectorMatches: any[] = [];
  if (searchMode !== 'keyword') {
    const queryTopK = documentIds?.length ? topK * 3 : 20;
    vectorMatches = await queryVectors(userId, questionEmbedding, queryTopK, pineconeFilter);
  }

  // 4. Full-text search (skip if semantic-only mode)
  let keywordMatches: { id: string; text: string; documentId: string; startIndex: number; pageNumber: number | null; rank: number }[] = [];
  if (searchMode !== 'semantic') {
    const docFilter = documentIds && documentIds.length > 0
      ? Prisma.sql`AND "documentId" IN (${Prisma.join(documentIds)})`
      : Prisma.empty;

    keywordMatches = await prisma.$queryRaw`
      SELECT id, text, "documentId", "startIndex", "pageNumber",
             ts_rank("textSearch", plainto_tsquery('english', ${question})) AS rank
      FROM "Chunk"
      WHERE "userId" = ${userId}
        AND "textSearch" @@ plainto_tsquery('english', ${question})
        ${docFilter}
      ORDER BY rank DESC
      LIMIT 10
    `;
  }

  // 5. Merge results and deduplicate
  const initialChunks: RetrievedChunk[] = vectorMatches.map((match) => {
    const metadata = match.metadata as VectorMetadata;
    return {
      text: metadata.text,
      documentId: metadata.documentId,
      documentName: '...',
      score: match.score || 0,
      page: metadata.pageNumber,
    };
  });

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

  // 6. Fetch document metadata for titles and recency
  const foundDocIds = Array.from(new Set(initialChunks.map(c => c.documentId)));
  const docs = await prisma.document.findMany({
    where: { id: { in: foundDocIds } },
    select: { id: true, name: true, createdAt: true },
  });
  const docMap = new Map(docs.map(d => [d.id, d]));

  initialChunks.forEach(c => {
    const doc = docMap.get(c.documentId);
    c.documentName = doc?.name || 'Unknown Document';
    c.createdAt = doc?.createdAt;
  });

  // 7. Diversification & Pruning (for multi-doc)
  let prunedChunks = initialChunks;
  if (documentIds && documentIds.length > 2) {
    const perDocLimit = documentIds.length > 5 ? 2 : 3;
    const docCounts: Record<string, number> = {};

    prunedChunks = initialChunks
      .sort((a, b) => b.score - a.score)
      .filter(chunk => {
        docCounts[chunk.documentId] = (docCounts[chunk.documentId] || 0) + 1;
        return docCounts[chunk.documentId] <= perDocLimit;
      });
  }

  // 8. Rerank results with Cohere
  const reranked = await rerankChunks(question, prunedChunks, topK);

  // 9. Apply recency bias (post-rerank score adjustment)
  if (recencyBias > 0) {
    const now = Date.now();
    const maxAgeMs = 90 * 24 * 60 * 60 * 1000; // 90 days
    reranked.forEach(chunk => {
      if (chunk.createdAt) {
        const ageMs = now - chunk.createdAt.getTime();
        const freshness = Math.max(0, 1 - (ageMs / maxAgeMs));
        chunk.score = chunk.score * (1 - recencyBias) + freshness * recencyBias;
      }
    });
    reranked.sort((a, b) => b.score - a.score);
  }

  return reranked;
}
