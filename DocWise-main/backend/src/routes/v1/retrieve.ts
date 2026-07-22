import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { retrieveRelevantChunks, SearchMode } from '../../services/retriever';
import { tryIncrementUsage, getEffectiveLimits } from '../../services/usage';

const retrieveSchema = z.object({
  query: z.string().min(1).max(4000).trim(),
  documentIds: z.array(z.string()).optional(),
  topK: z.number().int().min(1).max(20).optional().default(5),
  searchMode: z.enum(['semantic', 'keyword', 'hybrid']).optional().default('hybrid'),
  recencyBias: z.number().min(0).max(1).optional().default(0),
  filters: z.object({
    documentId: z.array(z.string()).optional(),
    uploadedAfter: z.string().datetime().optional(),
    uploadedBefore: z.string().datetime().optional(),
  }).optional(),
});

export async function retrieveRoutes(app: FastifyInstance) {
  app.post('/retrieve', async (req, reply) => {
    const userId = req.user!.id;
    const body = retrieveSchema.parse(req.body);

    const limits = getEffectiveLimits(req.user!);
    const allowed = await tryIncrementUsage(userId, 'questionsUsed', limits.maxQuestions);
    if (!allowed) {
      return reply.code(403).send({
        error: 'Query limit reached',
        message: `Your plan allows only ${limits.maxQuestions} queries per month.`,
      });
    }

    const chunks = await retrieveRelevantChunks(
      userId,
      body.query,
      body.topK,
      body.documentIds,
      body.searchMode as SearchMode,
      body.recencyBias,
      body.filters,
    );

    return reply.send({
      chunks,
      query: body.query,
      retrievedCount: chunks.length,
      searchMode: body.searchMode,
    });
  });
}
