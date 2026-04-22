import Fastify, { FastifyRequest as FR } from "fastify";
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

import { randomUUID } from "crypto";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import underPressure from "@fastify/under-pressure";
import cookie from "@fastify/cookie";
import csrf from "@fastify/csrf-protection";
import Redis from "ioredis";
import * as Sentry from "@sentry/node";
import { z } from "zod";
import { env } from "./config/env";
import { prisma } from "./utils/prisma";
import { authRoutes } from "./routes/auth";
import { documentRoutes } from "./routes/documents";
import { chatRoutes } from "./routes/chat";
import { billingRoutes } from "./routes/billing";
import { webhookRoutes } from "./routes/webhooks";
import { userRoutes } from "./routes/user";
import { adminRoutes } from "./routes/admin";
import { apiKeyRoutes } from "./routes/apiKeys";
import { feedbackRoutes } from "./routes/feedback";

type HttpMetricEntry = {
  count: number;
  totalMs: number;
  maxMs: number;
};

const httpMetrics = new Map<string, HttpMetricEntry>();

function recordRequestMetric(route: string, method: string, statusCode: number, durationMs: number) {
  const bucket = Math.floor(statusCode / 100);
  const key = `${method.toUpperCase()} ${route} ${bucket}xx`;
  const existing = httpMetrics.get(key) ?? { count: 0, totalMs: 0, maxMs: 0 };
  existing.count += 1;
  existing.totalMs += durationMs;
  existing.maxMs = Math.max(existing.maxMs, durationMs);
  httpMetrics.set(key, existing);
}

export const buildApp = (opts = {}) => {
  const app = Fastify(opts);

  app.register(helmet, {
    contentSecurityPolicy: false,
  });

  const redis = new Redis(env.REDIS_URL);

  app.register(rateLimit, {
    max: 100,
    timeWindow: "15 minutes",
    redis,
    keyGenerator: (req: any) => req.user?.id || req.ip
  });

  app.register(cookie, {
    secret: env.JWT_ACCESS_SECRET,
    parseOptions: {}
  });

  app.register(csrf, {
    cookieOpts: { signed: true, path: '/' },
    getToken: (req) => req.headers['x-csrf-token'] as string
  });

  app.register(underPressure, {
    maxEventLoopDelay: 1000,
    maxHeapUsedBytes: 1024 * 1024 * 1024,
    exposeStatusRoute: true,
  });

  app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  app.addHook("onRequest", async (request, reply) => {
    const requestId = (request.headers["x-request-id"] as string | undefined) ?? randomUUID();
    request.headers["x-request-id"] = requestId;
    reply.header("x-request-id", requestId);
    (request as any).__startedAt = Date.now();
  });

  app.addHook("onResponse", async (request, reply) => {
    const startedAt = (request as any).__startedAt ?? Date.now();
    const durationMs = Date.now() - startedAt;
    reply.header("x-response-time-ms", String(durationMs));

    const route = request.routeOptions.url || request.url || "unknown";
    recordRequestMetric(route, request.method, reply.statusCode, durationMs);
  });

  app.setErrorHandler((error: any, request, reply) => {
    Sentry.captureException(error);
    
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        error: "Validation Error",
        details: error.flatten().fieldErrors,
      });
    }

    if (error.statusCode) {
      return reply.code(error.statusCode).send({ error: error.message });
    }

    request.log.error(error);
    return reply.code(500).send({ error: "Internal Server Error" });
  });

  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(documentRoutes, { prefix: "/api/documents" });
  app.register(chatRoutes, { prefix: "/api/chat" });
  app.register(billingRoutes, { prefix: "/api/billing" });
  app.register(webhookRoutes, { prefix: "/api/webhooks" });
  app.register(userRoutes, { prefix: "/api/user" });
  app.register(adminRoutes, { prefix: "/api/admin" });
  app.register(apiKeyRoutes, { prefix: "/api/keys" });
  app.register(feedbackRoutes, { prefix: "/api/feedback" });

  app.get("/", async () => {
    return { message: "DocWise API running" };
  });

  app.get("/healthz", async () => {
    return { ok: true, ts: new Date().toISOString() };
  });

  app.get("/readyz", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({ ok: true });
    } catch (error) {
      app.log.error(error);
      return reply.code(503).send({ ok: false });
    }
  });

  app.get("/metrics", async (_request, reply) => {
    const rendered = Array.from(httpMetrics.entries())
      .map(([key, metric]) => {
        const avgMs = metric.count > 0 ? metric.totalMs / metric.count : 0;
        return `${key} count=${metric.count} avg_ms=${avgMs.toFixed(2)} max_ms=${metric.maxMs.toFixed(2)}`;
      })
      .join("\n");

    reply.header("content-type", "text/plain; charset=utf-8");
    return reply.send(rendered || "no_metrics_yet");
  });

  return app;
};
