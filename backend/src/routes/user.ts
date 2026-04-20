import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/auth';
import { getEffectiveLimits, isInTrial } from '../services/usage';

export async function userRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // Get current user profile + usage
  app.get('/me', async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        trialEndsAt: true,
        subscription: true
      }
    });

    if (!user) return reply.code(404).send({ error: 'User not found' });

    // Fetch usage for current month
    const month = new Date().toISOString().slice(0, 7);
    const usage = await prisma.usageLog.findUnique({
      where: { userId_month: { userId: user.id, month } }
    });

    const inTrial = isInTrial(user);
    const currentLimit = getEffectiveLimits(user);

    return reply.send({
      user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          role: user.role,
          trialEndsAt: user.trialEndsAt,
          inTrial
      },
      usage: {
          questionsUsed: usage?.questionsUsed || 0,
          questionsLimit: currentLimit.maxQuestions,
          docsUploaded: usage?.docsUploaded || 0,
          docsLimit: currentLimit.maxDocs,
          storageUsedMB: 0, // Mock for now, would need a sum of document sizes
          storageLimitMB: 100, // Default storage limit
          plan: inTrial ? 'trial' : user.plan.toLowerCase()
      }
    });
  });

  // Update profile
  app.patch('/profile', async (req, reply) => {
    const { name } = z.object({
      name: z.string().min(2)
    }).parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name }
    });

    return reply.send({ user });
  });

  // Change password
  app.post('/change-password', async (req, reply) => {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8)
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) return reply.code(404).send({ error: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return reply.code(401).send({ error: 'Invalid current password' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    return reply.send({ message: 'Password updated successfully' });
  });

  // Get API keys
  app.get('/api-keys', async (req, reply) => {
      const keys = await prisma.apiKey.findMany({
          where: { userId: req.user!.id, revokedAt: null }
      });
      return reply.send({ keys });
  });
}
