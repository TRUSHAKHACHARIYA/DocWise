import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../utils/auth';

export const requireAuth = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Decorate request with user info
    req.user = { id: decoded.userId };
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid or expired token' });
  }
};
