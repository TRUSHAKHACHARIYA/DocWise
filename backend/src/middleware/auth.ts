import { FastifyReply, FastifyRequest } from "fastify";
import { Plan, Role } from "@prisma/client";
import { verifyAccessToken } from '../utils/auth';
import { prisma } from '../utils/prisma';

export const requireAuth = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
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
