import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/auth';
import { requireOrg, requireOrgAdmin, requireOrgOwner, resolveOrgContext } from '../middleware/organization';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function organizationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // List organizations the current user belongs to
  app.get('/', async (req, reply) => {
    const memberships = await prisma.membership.findMany({
      where: { userId: req.user!.id },
      include: {
        organization: {
          include: {
            _count: { select: { members: true, documents: true, chatSessions: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      organizations: memberships.map(m => ({
        ...m.organization,
        myRole: m.role,
        memberCount: m.organization._count.members,
        documentCount: m.organization._count.documents,
        chatSessionCount: m.organization._count.chatSessions,
      })),
    });
  });

  // Create a new organization
  app.post('/', async (req, reply) => {
    const { name } = z.object({
      name: z.string().min(2).max(100),
    }).parse(req.body);

    let slug = slugify(name);
    // Ensure unique slug
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        ownerId: req.user!.id,
        plan: req.user!.plan,
        members: {
          create: {
            userId: req.user!.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return reply.code(201).send({ organization });
  });

  // Get organization details (requires membership)
  app.get('/:orgId', { preHandler: [resolveOrgContext] }, async (req, reply) => {
    const { orgId } = req.params as { orgId: string };

    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user!.id,
          organizationId: orgId,
        },
      },
    });

    if (!membership) {
      return reply.code(403).send({ error: 'Not a member of this organization' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: { select: { members: true, documents: true, chatSessions: true } },
      },
    });

    if (!organization) {
      return reply.code(404).send({ error: 'Organization not found' });
    }

    return reply.send({
      organization: {
        ...organization,
        myRole: membership.role,
        memberCount: organization._count.members,
        documentCount: organization._count.documents,
        chatSessionCount: organization._count.chatSessions,
      },
    });
  });

  // Update organization (owner only)
  app.patch('/:orgId', { preHandler: [requireOrgOwner] }, async (req, reply) => {
    const { orgId } = req.params as { orgId: string };
    const { name } = z.object({
      name: z.string().min(2).max(100).optional(),
    }).parse(req.body);

    const organization = await prisma.organization.update({
      where: { id: orgId },
      data: { ...(name && { name }) },
    });

    return reply.send({ organization });
  });

  // Delete organization (owner only)
  app.delete('/:orgId', { preHandler: [requireOrgOwner] }, async (req, reply) => {
    const { orgId } = req.params as { orgId: string };

    // Delete all org documents from S3/Pinecone first
    const documents = await prisma.document.findMany({
      where: { organizationId: orgId },
      select: { id: true, s3Key: true },
    });

    const { deleteFile } = await import('../services/fileStorage');
    const { deleteVectorsByDocumentId } = await import('../services/vectorStore');

    await Promise.all(
      documents.map(async (doc) => {
        try { await deleteFile(doc.s3Key); } catch {}
        try { await deleteVectorsByDocumentId(req.user!.id, doc.id); } catch {}
      })
    );

    await prisma.organization.delete({ where: { id: orgId } });

    return reply.send({ message: 'Organization deleted' });
  });

  // ─── Member Management ────────────────────────────────────────

  // List members
  app.get('/:orgId/members', { preHandler: [requireOrg] }, async (req, reply) => {
    const { orgId } = req.params as { orgId: string };

    const members = await prisma.membership.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, email: true, name: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send({
      members: members.map(m => ({
        ...m.user,
        role: m.role,
        joinedAt: m.createdAt,
        membershipId: m.id,
      })),
    });
  });

  // Invite member by email (admin or owner)
  app.post('/:orgId/members', { preHandler: [requireOrgAdmin] }, async (req, reply) => {
    const { orgId } = req.params as { orgId: string };
    const { email, role } = z.object({
      email: z.string().email(),
      role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
    }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.code(404).send({ error: 'User not found. They must create an account first.' });
    }

    const existing = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: orgId,
        },
      },
    });

    if (existing) {
      return reply.code(409).send({ error: 'User is already a member of this organization' });
    }

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: orgId,
        role,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return reply.code(201).send({
      member: {
        ...membership.user,
        role: membership.role,
        joinedAt: membership.createdAt,
        membershipId: membership.id,
      },
    });
  });

  // Update member role (owner only)
  app.patch('/:orgId/members/:membershipId', { preHandler: [requireOrgOwner] }, async (req, reply) => {
    const { orgId, membershipId } = req.params as { orgId: string; membershipId: string };
    const { role } = z.object({
      role: z.enum(['ADMIN', 'MEMBER']),
    }).parse(req.body);

    // Prevent changing own role
    const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
    if (!membership) {
      return reply.code(404).send({ error: 'Membership not found' });
    }
    if (membership.userId === req.user!.id) {
      return reply.code(400).send({ error: 'Cannot change your own role' });
    }
    if (membership.role === 'OWNER') {
      return reply.code(400).send({ error: 'Cannot change the owner role' });
    }

    const updated = await prisma.membership.update({
      where: { id: membershipId },
      data: { role },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return reply.send({
      member: {
        ...updated.user,
        role: updated.role,
        joinedAt: updated.createdAt,
        membershipId: updated.id,
      },
    });
  });

  // Remove member (admin or owner; cannot remove owner)
  app.delete('/:orgId/members/:membershipId', { preHandler: [requireOrgAdmin] }, async (req, reply) => {
    const { orgId, membershipId } = req.params as { orgId: string; membershipId: string };

    const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
    if (!membership || membership.organizationId !== orgId) {
      return reply.code(404).send({ error: 'Membership not found' });
    }
    if (membership.role === 'OWNER') {
      return reply.code(400).send({ error: 'Cannot remove the organization owner' });
    }

    await prisma.membership.delete({ where: { id: membershipId } });

    return reply.send({ message: 'Member removed' });
  });

  // Leave organization (owner cannot leave)
  app.delete('/:orgId/leave', { preHandler: [requireOrg] }, async (req, reply) => {
    const { orgId } = req.params as { orgId: string };

    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user!.id,
          organizationId: orgId,
        },
      },
    });

    if (!membership) {
      return reply.code(404).send({ error: 'Not a member' });
    }
    if (membership.role === 'OWNER') {
      return reply.code(400).send({ error: 'Owner cannot leave. Transfer ownership or delete the organization.' });
    }

    await prisma.membership.delete({ where: { id: membership.id } });

    return reply.send({ message: 'Left organization' });
  });
}
