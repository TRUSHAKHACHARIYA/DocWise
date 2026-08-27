import { queryVectors, VectorMetadata } from './vectorStore';
import { embedQuery } from '../modules/embeddings';
import { rerankChunks } from './reranker';
import { prisma } from '../utils/prisma';

export interface RetrievedChunk {
  text: string;
  documentId: string;
  documentName: string;
  score: number;
  page?: number;
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'of', 'to', 'in', 'on', 'for', 'and', 'or', 'but', 'if', 'then',
  'what', 'which', 'who', 'whom', 'whose', 'how', 'why', 'when', 'where',
  'does', 'do', 'did', 'doing', 'can', 'could', 'should', 'would', 'will', 'shall',
  'with', 'without', 'this', 'that', 'these', 'those', 'it', 'its', 'as', 'by',
  'has', 'have', 'had', 'not', 'no', 'yes', 'you', 'your', 'i', 'we', 'me', 'my', 'about',
]);

/**
 * Pulls out the significant, searchable words from a question. The keyword
 * leg of hybrid search matches on these instead of the raw question text,
 * since requiring a chunk to contain the entire question verbatim (the
 * previous behavior) matches almost nothing in practice.
 */
export function extractKeywords(question: string, max = 8): string[] {
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

  return Array.from(new Set(words)).slice(0, max);
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
  const keywords = extractKeywords(question);
  const keywordCandidates = keywords.length > 0
    ? await prisma.chunk.findMany({
        where: {
          userId,
          documentId: documentIds?.length ? { in: documentIds } : undefined,
          OR: keywords.map((keyword) => ({ text: { contains: keyword, mode: 'insensitive' as const } })),
        },
        take: 30,
        select: { id: true, text: true, documentId: true, startIndex: true, pageNumber: true }
      })
    : [];

  // findMany's OR only tells us a chunk matched at least one keyword, not how
  // relevant it is — rank by how many distinct keywords it actually contains
  // and keep the strongest matches.
  const keywordMatches = keywordCandidates
    .map((candidate) => {
      const lowerText = candidate.text.toLowerCase();
      const matchCount = keywords.filter((keyword) => lowerText.includes(keyword)).length;
      return { ...candidate, matchCount };
    })
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 10);

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
        // Base score for keyword matches before reranking, nudged up by how
        // many distinct keywords matched so the pre-rerank pruning step
        // (below) doesn't discard the strongest keyword hits first.
        score: Math.min(0.5 + km.matchCount * 0.05, 0.9),
        page: km.pageNumber || undefined,
      });
    }
  });

  if (initialChunks.length === 0) return [];

  // 5. Fetch document names for titles
  const foundDocIds = Array.from(new Set(initialChunks.map(c => c.documentId)));
  const docs = await prisma.document.findMany({
    where: { id: { in: foundDocIds }, userId },
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
