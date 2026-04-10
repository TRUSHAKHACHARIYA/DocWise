import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireAdmin } from '../middleware/auth';

export async function adminRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAdmin);

  // Get overall stats
  app.get('/stats', async (req, reply) => {
    const userCount = await prisma.user.count();
    const docCount = await prisma.document.count();
    const chatCount = await prisma.chatSession.count();
    const messageCount = await prisma.message.count();

    // Get recently active users (last 7 days)
    const activeUsers = await prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    });

    return reply.send({
      userCount,
      docCount,
      chatCount,
      messageCount,
      activeUsers
    });
  });

  // List users with search and pagination
  app.get('/users', async (req, reply) => {
    const query = z.object({
      search: z.string().optional(),
      page: z.string().transform(Number).optional().default('1'),
      limit: z.string().transform(Number).optional().default('20'),
    }).parse(req.query);

    const skip = (query.page - 1) * query.limit;

    const users = await prisma.user.findMany({
      where: query.search ? {
        OR: [
          { email: { contains: query.search, mode: 'insensitive' } },
          { name: { contains: query.search, mode: 'insensitive' } },
        ]
      } : {},
      include: {
        _count: {
          select: { documents: true, chatSessions: true }
        }
      },
      skip,
      take: query.limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({
        where: query.search ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' } },
              { name: { contains: query.search, mode: 'insensitive' } },
            ]
          } : {}
    });

    return reply.send({
      users: users.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          plan: u.plan,
          createdAt: u.createdAt,
          docCount: u._count.documents,
          chatCount: u._count.chatSessions
      })),
      total,
      pages: Math.ceil(total / query.limit)
    });
  });

  // Update user (e.g., change plan or role)
  app.patch('/users/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z.object({
        role: z.enum(['USER', 'ADMIN']).optional(),
        plan: z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']).optional(),
    }).parse(req.body);

    const user = await prisma.user.update({
        where: { id },
        data: body
    });

    return reply.send({ user });
  });

  // Delete/Ban user
  app.delete('/users/:id', async (req, reply) => {
      const { id } = z.object({ id: z.string() }).parse(req.params);
      
      // We'll just delete for now, but in real app we might soft-delete/ban
      await prisma.user.delete({ where: { id } });
      
      return reply.send({ message: 'User deleted successfully' });
  });

  // Analytics - Usage over time
  app.get('/analytics/usage', async (req, reply) => {
      const month = new Date().toISOString().slice(0, 7);
      const usage = await prisma.usageLog.groupBy({
          by: ['month'],
          _sum: {
              questionsUsed: true,
              docsUploaded: true
          }
      });
      return reply.send({ usage });
  });
}
