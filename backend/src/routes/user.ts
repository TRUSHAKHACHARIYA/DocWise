import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/auth';
import { deleteFile } from '../services/fileStorage';
import { deleteVectorsByDocumentId } from '../services/vectorStore';
import { getEffectiveLimits, getUserStorageUsedBytes, isInTrial } from '../services/usage';

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
    const storageUsedBytes = await getUserStorageUsedBytes(user.id);

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
          storageUsedMB: Math.round((storageUsedBytes / (1024 * 1024)) * 100) / 100,
          storageLimitMB: currentLimit.maxStorageMB,
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

  // Get user activity logs
  app.get('/activity', async (req, reply) => {
    const logs = await prisma.auditLog.findMany({
      where: { actorId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return reply.send({ logs });
  });

  // Permanently delete account and all associated data
  app.delete('/account', async (req, reply) => {
    const userId = req.user!.id;
    const { password } = z.object({
      password: z.string().min(1),
    }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.code(401).send({ error: 'Invalid password' });
    }

    const documents = await prisma.document.findMany({
      where: { userId },
      select: { id: true, s3Key: true },
    });

    await Promise.all(
      documents.map(async (doc) => {
        try {
          await deleteFile(doc.s3Key);
          await deleteVectorsByDocumentId(userId, doc.id);
        } catch (error) {
          req.log.warn({ error, documentId: doc.id }, 'Failed to clean up document during account deletion');
        }
      })
    );

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'ACCOUNT_DELETED',
        targetType: 'USER',
        targetId: userId,
        metadata: { email: user.email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    await prisma.user.delete({ where: { id: userId } });

    reply.clearCookie('refreshToken', { path: '/' });
    return reply.send({ message: 'Account deleted successfully' });
  });
}
