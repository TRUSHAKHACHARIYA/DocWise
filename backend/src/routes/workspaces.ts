import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireVerified } from '../middleware/auth';

export async function workspaceRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireVerified);

  app.get('/', async (req, reply) => {
    const userId = req.user!.id;

    const workspaces = await prisma.workspace.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { folders: true } },
        folders: {
          include: { _count: { select: { documents: true } } },
          orderBy: { name: 'asc' },
        },
      },
    });

    return reply.send({ workspaces });
  });

  app.post('/', async (req, reply) => {
    const userId = req.user!.id;
    const { name, description } = z.object({
      name: z.string().min(1).max(100).trim(),
      description: z.string().max(500).optional(),
    }).parse(req.body);

    const workspace = await prisma.workspace.create({
      data: { userId, name, description },
      include: { _count: { select: { folders: true } }, folders: true },
    });

    return reply.code(201).send({ workspace });
  });

  app.patch('/:id', async (req, reply) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };
    const body = z.object({
      name: z.string().min(1).max(100).trim().optional(),
      description: z.string().max(500).nullable().optional(),
    }).parse(req.body);

    const workspace = await prisma.workspace.findFirst({ where: { id, userId } });
    if (!workspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

    const updated = await prisma.workspace.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
      },
      include: {
        _count: { select: { folders: true } },
        folders: {
          include: { _count: { select: { documents: true } } },
          orderBy: { name: 'asc' },
        },
      },
    });

    return reply.send({ workspace: updated });
  });

  app.delete('/:id', async (req, reply) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };

    const workspace = await prisma.workspace.findFirst({ where: { id, userId } });
    if (!workspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

    await prisma.workspace.delete({ where: { id } });
    return reply.send({ success: true });
  });
}
