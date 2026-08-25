import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const csvToList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  BACKEND_PUBLIC_URL: z.string().url().default("http://localhost:4000"),
  CORS_ORIGINS: z.string().default(""),

  DATABASE_URL: z.string().min(1, "Missing required env var: DATABASE_URL"),

  JWT_ACCESS_SECRET: z.string().min(1, "Missing required env var: JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: z.string().min(1, "Missing required env var: JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  S3_ENDPOINT: z.string().min(1, "Missing required env var: S3_ENDPOINT"),
  S3_ACCESS_KEY_ID: z.string().min(1, "Missing required env var: S3_ACCESS_KEY_ID"),
  S3_SECRET_ACCESS_KEY: z.string().min(1, "Missing required env var: S3_SECRET_ACCESS_KEY"),
  S3_BUCKET_NAME: z.string().min(1, "Missing required env var: S3_BUCKET_NAME"),
  S3_REGION: z.string().default("auto"),

  EMBEDDING_PROVIDER: z.enum(["openai", "anthropic", "cohere"]).default("openai"),
  OPENAI_API_KEY: z.string().default(""),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  ANTHROPIC_API_KEY: z.string().default(""),
  ANTHROPIC_EMBEDDING_MODEL: z.string().default("claude-embedding-3"),
  COHERE_API_KEY: z.string().default(""),
  COHERE_EMBEDDING_MODEL: z.string().default("embed-multilingual-v3.0"),
  CHUNKING_STRATEGY: z.enum(["fixed", "recursive", "document"]).optional(),

  PINECONE_API_KEY: z.string().min(1, "Missing required env var: PINECONE_API_KEY"),
  PINECONE_INDEX: z.string().min(1, "Missing required env var: PINECONE_INDEX"),

  RESEND_API_KEY: z.string().default(""),
  EMAIL_FROM: z.string().default("noreply@docwise.app"),

  NMI_PRIVATE_API_KEY: z.string().default(""),
  NMI_API_BASE_URL: z.string().url().default("https://secure.nmi.com/api/v5"),
  NMI_PLAN_STARTER: z.string().default("STARTER"),
  NMI_PLAN_PRO: z.string().default("PRO"),
  NMI_WEBHOOK_SECRET: z.string().default(""),
  NMI_WEBHOOK_EVENTS: z
    .string()
    .default("subscription.created,subscription.updated,subscription.cancelled"),

  REDIS_URL: z.string().default("redis://localhost:6379"),
  SENTRY_DSN: z.string().default(""),
});

const parsed = envSchema.parse(process.env);

if (parsed.NODE_ENV === "production" && !parsed.DATABASE_URL.startsWith("postgresql")) {
  throw new Error("Production requires a PostgreSQL DATABASE_URL (postgresql://...)");
}

export const env = {
  ...parsed,
  CORS_ORIGINS: csvToList(parsed.CORS_ORIGINS),
};
