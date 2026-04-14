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

    // Decorate request with user info
    req.user = { 
      id: decoded.userId,
      role: decoded.role
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
