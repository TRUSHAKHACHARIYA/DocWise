import 'fastify';
import { Plan, Role, OrgRole } from "@prisma/client";

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: Role;
      plan: Plan;
      trialEndsAt?: Date | null;
    };
    org?: {
      organizationId: string;
      membershipRole: OrgRole;
    };
  }
}
