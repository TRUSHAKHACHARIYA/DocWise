import { FastifyRequest } from 'fastify';
import { Role, Plan } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: Role;
      plan: Plan;
      trialEndsAt?: Date | null;
    };
  }
}
