import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: parseInt(optional("PORT", "4000"), 10),
  FRONTEND_URL: optional("FRONTEND_URL", "http://localhost:3000"),

  DATABASE_URL: required("DATABASE_URL"),

  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES: optional("JWT_ACCESS_EXPIRES", "15m"),
  JWT_REFRESH_EXPIRES: optional("JWT_REFRESH_EXPIRES", "7d"),

  S3_ENDPOINT: required("S3_ENDPOINT"),
  S3_ACCESS_KEY_ID: required("S3_ACCESS_KEY_ID"),
  S3_SECRET_ACCESS_KEY: required("S3_SECRET_ACCESS_KEY"),
  S3_BUCKET_NAME: required("S3_BUCKET_NAME"),
  S3_REGION: optional("S3_REGION", "auto"),

  // Embedding Provider Configuration
  EMBEDDING_PROVIDER: optional("EMBEDDING_PROVIDER", "openai"), // openai, anthropic, cohere
  OPENAI_API_KEY: optional("OPENAI_API_KEY", ""),
  OPENAI_EMBEDDING_MODEL: optional("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
  ANTHROPIC_API_KEY: optional("ANTHROPIC_API_KEY", ""),
  ANTHROPIC_EMBEDDING_MODEL: optional("ANTHROPIC_EMBEDDING_MODEL", "claude-embedding-3"),
  COHERE_API_KEY: optional("COHERE_API_KEY", ""),
  COHERE_EMBEDDING_MODEL: optional("COHERE_EMBEDDING_MODEL", "embed-multilingual-v3.0"),
  
  // Vector Database
  PINECONE_API_KEY: required("PINECONE_API_KEY"),
  PINECONE_INDEX: required("PINECONE_INDEX"),

  RESEND_API_KEY: optional("RESEND_API_KEY", ""),
  EMAIL_FROM: optional("EMAIL_FROM", "noreply@docwise.app"),

  STRIPE_SECRET_KEY: optional("STRIPE_SECRET_KEY", ""),
  STRIPE_WEBHOOK_SECRET: optional("STRIPE_WEBHOOK_SECRET", ""),
  STRIPE_PRICE_STARTER: optional("STRIPE_PRICE_STARTER", ""),
  STRIPE_PRICE_PRO: optional("STRIPE_PRICE_PRO", ""),

  REDIS_URL: optional("REDIS_URL", "redis://localhost:6379"),
  SENTRY_DSN: optional("SENTRY_DSN", ""),
};
