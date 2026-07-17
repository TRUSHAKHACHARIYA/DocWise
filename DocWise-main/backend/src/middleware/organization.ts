import { FastifyRequest, FastifyReply } from 'fastify';
import { OrgRole } from '@prisma/client';
import { prisma } from '../utils/prisma';

export type OrgContext = {
  organizationId: string;
  membershipRole: OrgRole;
};

declare module 'fastify' {
  interface FastifyRequest {
    org?: OrgContext;
  }
}

/**
 * Resolve organization context from the `x-org-id` header.
 * Must run after `requireAuth`. Sets `req.org` if valid membership exists.
 */
export const resolveOrgContext = async (req: FastifyRequest, reply: FastifyReply) => {
  const orgId = req.headers['x-org-id'] as string | undefined;
  if (!orgId) {
    req.org = undefined;
    return;
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: req.user!.id,
        organizationId: orgId,
      },
    },
    select: { role: true, organizationId: true },
  });

  if (!membership) {
    return reply.code(403).send({ error: 'Not a member of this organization' });
  }

  req.org = {
    organizationId: membership.organizationId,
    membershipRole: membership.role,
  };
};

/**
 * Require that the request is scoped to an organization (x-org-id header present and valid).
 */
export const requireOrg = async (req: FastifyRequest, reply: FastifyReply) => {
  await resolveOrgContext(req, reply);
  if (reply.sent) return;

  if (!req.org) {
    return reply.code(400).send({ error: 'Organization context required (set x-org-id header)' });
  }
};

/**
 * Require ADMIN or OWNER role in the current organization.
 */
export const requireOrgAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
  await requireOrg(req, reply);
  if (reply.sent) return;

  if (req.org!.membershipRole !== 'OWNER' && req.org!.membershipRole !== 'ADMIN') {
    return reply.code(403).send({ error: 'Organization admin access required' });
  }
};

/**
 * Require OWNER role in the current organization.
 */
export const requireOrgOwner = async (req: FastifyRequest, reply: FastifyReply) => {
  await requireOrg(req, reply);
  if (reply.sent) return;

  if (req.org!.membershipRole !== 'OWNER') {
    return reply.code(403).send({ error: 'Organization owner access required' });
  }
};

/**
 * Check if a user has access to a document, considering org membership.
 * A user can access a document if:
 * - They own it (userId matches), OR
 * - The document belongs to an org they are a member of
 */
export async function canAccessDocument(userId: string, documentId: string, organizationId?: string | null): Promise<boolean> {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { userId: true, organizationId: true },
  });

  if (!doc) return false;
  if (doc.userId === userId) return true;

  if (doc.organizationId) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: doc.organizationId,
        },
      },
    });
    return !!membership;
  }

  return false;
}

/**
 * Get all organization IDs that a user is a member of.
 */
export async function getUserOrganizationIds(userId: string): Promise<string[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { organizationId: true },
  });
  return memberships.map(m => m.organizationId);
}
