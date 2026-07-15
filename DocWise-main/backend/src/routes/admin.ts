import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireAdmin } from '../middleware/auth';
import { cleanupUserData } from '../services/cleanup';

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

    // Get plan distribution
    const planDistribution = await prisma.user.groupBy({
        by: ['plan'],
        _count: { plan: true }
    });

    return reply.send({
      userCount,
      docCount,
      chatCount,
      messageCount,
      activeUsers,
      planDistribution: planDistribution.map(p => ({
          plan: p.plan,
          count: p._count.plan
      }))
    });
  });

  // List users with search and pagination
  app.get('/users', async (req, reply) => {
    const query = z.object({
      search: z.string().optional(),
      page: z.string().transform(Number).optional().default(1),
      limit: z.string().transform(Number).optional().default(20),
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
      
      await cleanupUserData(id, 'admin deletion');
      
      return reply.send({ message: 'User deleted successfully' });
  });

  // Analytics - Usage over time
  app.get('/analytics/usage', async (req, reply) => {
      const usage = await prisma.usageLog.findMany({
          orderBy: { month: 'asc' },
          take: 12
      });
      return reply.send({ usage });
  });

  // Platform summary metrics for analytics dashboard
  app.get('/analytics/summary', async (_req, reply) => {
    const totalUsers = await prisma.user.count();
    const paidUsers = await prisma.user.count({
      where: { plan: { not: 'FREE' } },
    });

    const sessionMessageCounts = await prisma.chatSession.findMany({
      select: { _count: { select: { messages: true } } },
    });

    const avgChatLength = sessionMessageCounts.length > 0
      ? sessionMessageCounts.reduce((sum, session) => sum + session._count.messages, 0) / sessionMessageCounts.length
      : 0;

    const planDistribution = await prisma.user.groupBy({
      by: ['plan'],
      _count: { plan: true },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentQuestions = await prisma.usageLog.aggregate({
      where: { month: { gte: thirtyDaysAgo.toISOString().slice(0, 7) } },
      _sum: { questionsUsed: true },
    });

    return reply.send({
      totalUsers,
      paidUsers,
      conversionRate: totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 1000) / 10 : 0,
      avgChatLength: Math.round(avgChatLength * 10) / 10,
      questionsLast30Days: recentQuestions._sum.questionsUsed ?? 0,
      planDistribution: planDistribution.map((entry) => ({
        plan: entry.plan,
        count: entry._count.plan,
      })),
    });
  });

  // NEW: Growth Analytics (Daily stats for last 30 days)
  app.get('/analytics/growth', async (req, reply) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Fetch individual records since we need to group by day
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    const docs = await prisma.document.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    const messages = await prisma.message.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    // Helper to group by date string YYYY-MM-DD
    const groupByDay = (data: any[]) => {
      const groups: Record<string, number> = {};
      data.forEach(item => {
        const day = item.createdAt.toISOString().split('T')[0];
        groups[day] = (groups[day] || 0) + 1;
      });
      return groups;
    };

    const userGrowth = groupByDay(users);
    const docGrowth = groupByDay(docs);
    const messageGrowth = groupByDay(messages);

    // Generate last 30 days array to ensure no gaps
    const history = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const day = d.toISOString().split('T')[0];
      history.push({
        date: day,
        users: userGrowth[day] || 0,
        documents: docGrowth[day] || 0,
        messages: messageGrowth[day] || 0
      });
    }

    return reply.send({ history });
  });

  // NEW: Audit Logs - Browse system activity
  app.get('/logs', async (req, reply) => {
    const query = z.object({
      search: z.string().optional(),
      page: z.string().transform(Number).optional().default(1),
      limit: z.string().transform(Number).optional().default(50),
    }).parse(req.query);

    const skip = (query.page - 1) * query.limit;

    const logs = await prisma.auditLog.findMany({
      where: query.search ? {
        OR: [
          { action: { contains: query.search, mode: 'insensitive' } },
          { actorId: { contains: query.search, mode: 'insensitive' } },
          { targetType: { contains: query.search, mode: 'insensitive' } },
        ]
      } : {},
      skip,
      take: query.limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.auditLog.count({
      where: query.search ? {
        OR: [
          { action: { contains: query.search, mode: 'insensitive' } },
          { actorId: { contains: query.search, mode: 'insensitive' } },
          { targetType: { contains: query.search, mode: 'insensitive' } },
        ]
      } : {}
    });

    return reply.send({
      logs,
      total,
      pages: Math.ceil(total / query.limit)
    });
  });
  
  // NEW: Ingestion Dead-Letter Queue - Triage failed background jobs
  app.get('/queue/dead-letter', async (req, reply) => {
    const { getDeadLetterJobs } = await import('../services/queue');
    const jobs = await getDeadLetterJobs();
    return reply.send({ jobs });
  });

  app.post('/queue/dead-letter/retry/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { retryDeadLetterJob } = await import('../services/queue');
    await retryDeadLetterJob(id);
    return reply.send({ message: 'Job rescheduled for processing' });
  });
}
