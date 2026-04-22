import { Plan, Role } from "@prisma/client";

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
