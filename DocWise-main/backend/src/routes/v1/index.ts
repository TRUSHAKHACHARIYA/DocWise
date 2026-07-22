import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { retrieveRoutes } from './retrieve';
import { v1DocumentRoutes } from './documents';

export async function v1Routes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.register(retrieveRoutes);
  app.register(v1DocumentRoutes);
}
