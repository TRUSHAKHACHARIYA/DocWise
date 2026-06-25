import { createHash } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { Plan, Role } from "@prisma/client";
import { verifyAccessToken } from '../utils/auth';
import { prisma } from '../utils/prisma';

async function authenticateApiKey(rawKey: string): Promise<{
  id: string;
  role: Role;
  plan: Plan;
  trialEndsAt: Date | null;
} | null> {
  if (!rawKey.startsWith('dw_')) {
    return null;
  }

  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const apiKey = await prisma.apiKey.findFirst({
    where: { keyHash, revokedAt: null },
    include: {
      user: {
        select: { id: true, role: true, plan: true, trialEndsAt: true },
      },
    },
  });

  if (!apiKey) {
    return null;
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey.user;
}

export const requireAuth = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return reply.code(401).send({ error: 'Authentication required' });
    }

    if (token.startsWith('dw_')) {
      const apiKeyUser = await authenticateApiKey(token);
      if (!apiKeyUser) {
        return reply.code(401).send({ error: 'Invalid or revoked API key' });
      }

      req.user = {
        id: apiKeyUser.id,
        role: apiKeyUser.role as Role,
        plan: apiKeyUser.plan as Plan,
        trialEndsAt: apiKeyUser.trialEndsAt,
      };
      return;
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, plan: true, trialEndsAt: true },
    });

    if (!user) {
      return reply.code(401).send({ error: "User no longer exists" });
    }

    req.user = {
      id: user.id,
      role: user.role as Role,
      plan: user.plan as Plan,
      trialEndsAt: user.trialEndsAt,
    };
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(req, reply);
  if (reply.sent) return;

  if (req.user?.role !== 'ADMIN') {
    return reply.code(403).send({ error: 'Forbidden: Admin access required' });
  }
};

export const requireVerified = async (req: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(req, reply);
  if (reply.sent) return;

  const user = await prisma.user.findUnique({ 
    where: { id: req.user!.id },
    select: { verifiedAt: true }
  });

  if (!user?.verifiedAt) {
    return reply.code(403).send({ 
      error: 'Email verification required', 
      code: 'EMAIL_UNVERIFIED' 
    });
  }
};
