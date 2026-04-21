import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/auth';

export async function feedbackRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.post('/', async (req, reply) => {
    const userId = (req as any).user.id;
    const { content, type } = z.object({
      content: z.string().min(5).max(1000),
      type: z.enum(['BUG', 'FEATURE', 'PRAISE']).default('PRAISE')
    }).parse(req.body);

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        content,
        type
      }
    });

    return reply.send({ message: 'Feedback submitted successfully', id: feedback.id });
  });

  // Admin only: Get all feedback
  app.get('/', async (req, reply) => {
    const user = (req as any).user;
    if (user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Unauthorized' });
    }

    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reply.send({ feedbacks });
  });
}
