import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireVerified } from '../middleware/auth';

export async function folderRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireVerified);

  app.get('/', async (req, reply) => {
    const userId = req.user!.id;
    const { workspaceId } = z.object({
      workspaceId: z.string().uuid().optional(),
    }).parse(req.query);

    const folders = await prisma.folder.findMany({
      where: {
        userId,
        ...(workspaceId ? { workspaceId } : {}),
      },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { documents: true } },
        workspace: { select: { id: true, name: true } },
      },
    });

    return reply.send({ folders });
  });

  app.post('/', async (req, reply) => {
    const userId = req.user!.id;
    const { name, workspaceId } = z.object({
      name: z.string().min(1).max(100).trim(),
      workspaceId: z.string().uuid().optional(),
    }).parse(req.body);

    if (workspaceId) {
      const workspace = await prisma.workspace.findFirst({ where: { id: workspaceId, userId } });
      if (!workspace) {
        return reply.code(404).send({ error: 'Workspace not found' });
      }
    }

    const folder = await prisma.folder.create({
      data: { userId, name, workspaceId },
      include: { _count: { select: { documents: true } } },
    });

    return reply.code(201).send({ folder });
  });

  app.patch('/:id', async (req, reply) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };
    const body = z.object({
      name: z.string().min(1).max(100).trim().optional(),
      workspaceId: z.string().uuid().nullable().optional(),
    }).parse(req.body);

    const folder = await prisma.folder.findFirst({ where: { id, userId } });
    if (!folder) {
      return reply.code(404).send({ error: 'Folder not found' });
    }

    if (body.workspaceId) {
      const workspace = await prisma.workspace.findFirst({ where: { id: body.workspaceId, userId } });
      if (!workspace) {
        return reply.code(404).send({ error: 'Workspace not found' });
      }
    }

    const updated = await prisma.folder.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.workspaceId !== undefined ? { workspaceId: body.workspaceId } : {}),
      },
      include: {
        _count: { select: { documents: true } },
        workspace: { select: { id: true, name: true } },
      },
    });

    return reply.send({ folder: updated });
  });

  app.delete('/:id', async (req, reply) => {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };

    const folder = await prisma.folder.findFirst({ where: { id, userId } });
    if (!folder) {
      return reply.code(404).send({ error: 'Folder not found' });
    }

    await prisma.folder.delete({ where: { id } });
    return reply.send({ success: true });
  });
}
