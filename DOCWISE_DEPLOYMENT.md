# DocWise Deployment Guide

Architecture-specific to this codebase:

```
DocWise
├── frontend/   → Next.js 15 (React 19)      → Vercel
├── backend/    → Fastify 5 API + RAG        → Container host (Railway / Render / Fly.io / VPS)
│                 ├── BullMQ ingestion worker (initWorker)
│                 ├── OCR (tesseract), embedding, indexing pipelines
├── PostgreSQL  → Prisma                      → Managed (Neon / Supabase / RDS)
├── Redis       → BullMQ queues               → Managed (Upstash / Railway / ElastiCache)
├── Pinecone    → Vector index                → Pinecone Cloud
└── S3 storage  → Document files              → S3 / Cloudflare R2 / MinIO
```

> **Why not all-on-Vercel?** The backend runs long-lived work: BullMQ workers,
> scanned-PDF OCR, batch embeddings, and webhooks. These need a persistent
> process, not serverless functions. Keep Vercel for `frontend/` only.

---

## 1. Frontend → Vercel

### Repository layout note

This GitHub repo has a **nested project folder**:

```
<repo-root>/
└── DocWise-main/
    ├── frontend/
    └── backend/
```

When importing into Vercel set:

```text
Project Settings → General → Root Directory → DocWise-main/frontend
```

(Or restructure the repo so `frontend/` is at the root, then set Root Directory → `frontend`.)

### Build settings (auto-detected)

```text
Framework Preset:  Next.js
Install Command:   npm install
Build Command:     npm run build
Output Directory:  .next
```

### Environment variables (Settings → Environment Variables)

| Variable | Example | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.docwise.com` | Public — browser calls this directly |
| `NEXT_PUBLIC_NMI_COLLECT_JS_KEY` | *(from NMI portal)* | Public payment key |

These are the only two variables the frontend reads (`src/**` verified). Add them
to Production and Preview environments, then **redeploy** — `NEXT_PUBLIC_*`
values are baked in at build time.

---

## 2. Backend → Container Host

Deploy the same Dockerfile/image twice (or one service + one worker service once
a dedicated worker entry exists):

```text
API service:     npm run build && node dist/server.js   (PORT=4000)
Worker service:  same image (see §4)
```

Recommended hosts: **Railway** (easiest, Redis+Postgres add-ons), **Render**,
**Fly.io**, or any VPS with Docker. Do not use Vercel serverless for this process.

### Required environment variables (from `backend/src/config/env.ts`)

```env
NODE_ENV=production
PORT=4000

# Core
DATABASE_URL=postgresql://user:pass@host:5432/docwise?sslmode=require
REDIS_URL=rediss://default:pass@host:6379
FRONTEND_URL=https://app.docwise.com
BACKEND_PUBLIC_URL=https://api.docwise.com
CORS_ORIGINS=https://app.docwise.com

# Auth
JWT_ACCESS_SECRET=<long-random>
JWT_REFRESH_SECRET=<long-random>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Storage (S3-compatible)
S3_ENDPOINT=https://s3.<region>.amazonaws.com   # or R2/MinIO endpoint
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=docwise-prod
S3_REGION=auto

# Vector DB
PINECONE_API_KEY=...
PINECONE_INDEX=docwise-prod

# AI providers (EMBEDDING_PROVIDER picks one path)
EMBEDDING_PROVIDER=openai            # openai | anthropic(Voyage) | cohere
OPENAI_API_KEY=...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
ANTHROPIC_API_KEY=...                # LLM for chat/summaries
ANTHROPIC_CHAT_MODEL=claude-3-5-sonnet-20241022
VOYAGE_API_KEY=...                   # only if EMBEDDING_PROVIDER=anthropic
COHERE_API_KEY=...                   # reranking + optional embeddings

# Chunking (Phase 1 addition; omit for default 'fixed')
CHUNKING_STRATEGY=fixed              # fixed | recursive | document

# Email (Resend)
RESEND_API_KEY=...
EMAIL_FROM=noreply@docwise.com

# Billing (NMI)
NMI_PRIVATE_API_KEY=...
NMI_WEBHOOK_SECRET=...
NMI_PLAN_STARTER=STARTER
NMI_PLAN_PRO=PRO

# Google Drive integration
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.docwise.com/api/integrations/google-drive/callback

# Observability
SENTRY_DSN=...
```

Notes:
- `PINECONE_ENVIRONMENT` is **not** needed (Pinecone SDK v7).
- There is no `/health` route — liveness check: `GET /` → `200 {"message":"DocWise API running"}`.
- Never prefix backend secrets with `NEXT_PUBLIC_`.

---

## 3. Database migration on release

Run before each production deploy:

```bash
npx prisma migrate deploy
```

(Railway/Render: add as release command; Docker: entrypoint step.)

---

## 4. Workers

Current state: `server.ts` boots the BullMQ worker **in-process** via
`initWorker()` (`backend/src/services/queue.ts`) when Redis is reachable.
If Redis is down in non-production it falls back to inline processing
(`QUEUE_INLINE_FALLBACK=true` forces this).

For production scale-out:

1. Keep Redis required (`QUEUE_INLINE_FALLBACK` unset).
2. Add a dedicated worker entrypoint (`src/workers.ts` calling `initWorker()` without `app.listen`)
   and run it as a second service from the same image.
3. Scale API and workers independently; both share `REDIS_URL`.

Job pipeline per document: download → parse (pdf/docx/html/md/csv/text/OCR) →
clean → structure detection → chunking → summary/context (LLM) → embeddings →
Pinecone upsert → Postgres chunks + tsvector.

---

## 5. Post-deploy configuration

| Item | Value |
|---|---|
| CORS | `CORS_ORIGINS` must include the exact Vercel domain(s), comma-separated |
| NMI webhook URL | `https://api.docwise.com/api/webhooks/nmi` (verify exact route in `backend/src/routes/webhooks.ts`) |
| Google OAuth redirect | Match `GOOGLE_REDIRECT_URI` in Google Cloud Console |
| Sentry | Set `SENTRY_DSN` on both apps |

---

## 6. Deploy checklist

Before:

```text
[ ] npm run build succeeds locally (frontend AND backend)
[ ] npx tsc --noEmit clean
[ ] .env / .env.local NOT committed
[ ] Managed Postgres reachable; prisma migrate deploy run
[ ] Managed Redis (rediss://) reachable from backend host
[ ] Pinecone index created; PINECONE_INDEX matches
[ ] S3 bucket + IAM keys valid
[ ] CORS_ORIGINS includes Vercel domain
```

After:

```text
[ ] Frontend loads at https://<app>.vercel.app
[ ] Signup / login works (JWT cookies across domains — use same-site domain or token header)
[ ] Document upload → ingestion completes (status READY)
[ ] Chat answers with citations
[ ] NMI test subscription webhook received
[ ] Sentry receives a test error
```

> **Cookie caveat:** the backend issues JWT cookies (`@fastify/cookie`). A
> Vercel app on `*.vercel.app` talking to an API on another domain may hit
> third-party cookie restrictions. Prefer custom domains under one registrable
> domain (`app.docwise.com` + `api.docwise.com`) in production.
