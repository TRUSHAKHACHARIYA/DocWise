import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import underPressure from "@fastify/under-pressure";
import { z } from "zod";
import { env } from "./config/env";
import { authRoutes } from "./routes/auth";
import { documentRoutes } from "./routes/documents";
import { chatRoutes } from "./routes/chat";
import { billingRoutes } from "./routes/billing";
import { webhookRoutes } from "./routes/webhooks";
import { userRoutes } from "./routes/user";
import { adminRoutes } from "./routes/admin";

export const buildApp = (opts = {}) => {
  const app = Fastify(opts);

  // Security: Helmet for secure headers
  app.register(helmet, {
      contentSecurityPolicy: false,
  });

  // Performance: Rate Limiting
  app.register(rateLimit, {
      max: 100,
      timeWindow: '15 minutes',
  });

  // Performance: Under Pressure monitor
  app.register(underPressure, {
      maxEventLoopDelay: 1000,
      maxHeapUsedBytes: 1024 * 1024 * 1024,
      exposeStatusRoute: true
  });

  app.register(cors, {
      origin: env.FRONTEND_URL,
  });

  // Global Error Handler for Zod and generic errors
  app.setErrorHandler((error: any, request, reply) => {
      if (error instanceof z.ZodError) {
          return reply.code(400).send({
              error: 'Validation Error',
              details: error.flatten().fieldErrors
          });
      }
      
      if (error.statusCode) {
          return reply.code(error.statusCode).send({ error: error.message });
      }
      
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
  });

  // Routes
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(documentRoutes, { prefix: '/api/documents' });
  app.register(chatRoutes, { prefix: '/api/chat' });
  app.register(billingRoutes, { prefix: '/api/billing' });
  app.register(webhookRoutes, { prefix: '/api/webhooks' });
  app.register(userRoutes, { prefix: '/api/user' });
  app.register(adminRoutes, { prefix: '/api/admin' });

  app.get("/", async () => {
      return { message: "DocWise API running 🚀" };
  });

  return app;
};
