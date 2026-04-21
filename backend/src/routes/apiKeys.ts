import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/auth';
import { randomBytes, createHash } from 'crypto';

export async function apiKeyRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // List keys
  app.get('/', async (req, reply) => {
    const userId = (req as any).user.id;
    const keys = await prisma.apiKey.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    // Never return the actual hash or hint of the key
    return reply.send({ keys });
  });

  // Create key
  app.post('/', async (req, reply) => {
    const userId = (req as any).user.id;
    const body = z.object({
      name: z.string().min(1).max(50),
    }).parse(req.body);

    // Check plan - only PRO and ENTERPRISE get API keys
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.plan !== 'PRO' && user.plan !== 'ENTERPRISE' && user.role !== 'ADMIN')) {
      return reply.code(403).send({ error: 'API access requires a Pro plan.' });
    }

    // Generate a secure random key
    const rawKey = `dw_${randomBytes(24).toString('hex')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name: body.name,
        keyHash,
      }
    });

    // RETURN THE RAW KEY ONLY ONCE
    return reply.send({ 
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, 
      createdAt: apiKey.createdAt 
    });
  });

  // Revoke/Delete key
  app.delete('/:id', async (req, reply) => {
    const userId = (req as any).user.id;
    const { id } = z.object({ id: z.string() }).parse(req.params);

    await prisma.apiKey.updateMany({
      where: { id, userId },
      data: { revokedAt: new Date() }
    });

    return reply.send({ message: 'Key revoked successfully.' });
  });
}
