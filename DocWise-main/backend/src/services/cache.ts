import { createHash } from 'crypto';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const CACHE_TTL_HOURS = 24;
const MAX_CACHE_ENTRIES_PER_USER = 1000;

function generateCacheKey(query: string, documentIds?: string[]): string {
  const normalizedQuery = query.toLowerCase().trim();
  const docPart = documentIds ? [...documentIds].sort().join(',') : 'all';
  return createHash('sha256').update(`${normalizedQuery}:${docPart}`).digest('hex');
}

export async function getCachedResponse(
  userId: string,
  query: string,
  documentIds?: string[],
): Promise<{ response: string; confidence: number } | null> {
  try {
    const queryHash = generateCacheKey(query, documentIds);

    const cached = await prisma.queryCache.findUnique({
      where: { userId_queryHash: { userId, queryHash } },
    });

    if (!cached) return null;
    if (cached.expiresAt < new Date()) {
      await prisma.queryCache.delete({ where: { id: cached.id } });
      return null;
    }

    // Increment hit count
    await prisma.queryCache.update({
      where: { id: cached.id },
      data: { hitCount: { increment: 1 } },
    });

    logger.info(`Cache hit for user ${userId}`, { queryHash, hitCount: cached.hitCount + 1 });
    return { response: cached.response, confidence: cached.confidence };
  } catch (err: any) {
    logger.warn(`Cache lookup failed: ${err.message}`);
    return null;
  }
}

export async function setCachedResponse(
  userId: string,
  query: string,
  documentIds: string[] | undefined,
  response: string,
  confidence: number,
): Promise<void> {
  try {
    const queryHash = generateCacheKey(query, documentIds);
    const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000);

    // Prune old cache entries if too many
    const count = await prisma.queryCache.count({ where: { userId } });
    if (count >= MAX_CACHE_ENTRIES_PER_USER) {
      const oldest = await prisma.queryCache.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 50,
        select: { id: true },
      });
      await prisma.queryCache.deleteMany({
        where: { id: { in: oldest.map(o => o.id) } },
      });
    }

    await prisma.queryCache.upsert({
      where: { userId_queryHash: { userId, queryHash } },
      update: { response, confidence, expiresAt, hitCount: 0 },
      create: {
        userId,
        queryHash,
        documentIds: documentIds || [],
        response,
        confidence,
        expiresAt,
      },
    });
  } catch (err: any) {
    logger.warn(`Cache store failed: ${err.message}`);
  }
}
