import { FastifyReply, FastifyRequest } from 'fastify';

export const requireAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.user;

  if (!user || user.role !== 'ADMIN') {
    return reply.code(403).send({ error: 'Admin access required' });
  }
};
