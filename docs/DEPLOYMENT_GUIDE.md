# DocWise Production Deployment Guide — Launch Runbook (target: 19 Oct 2026)

This is the single source of truth for deploying DocWise. Every variable and
route below was checked against the code (`backend/src/config/env.ts`,
`backend/src/app.ts`, `frontend/src/lib/apiConfig.ts`).

```
frontend/  Next.js 15            → Vercel          (Root Directory: frontend)
backend/   Fastify API + worker  → Railway         (Root Directory: backend, uses backend/railway.json)
Postgres   Prisma                → Railway Postgres / Neon / Supabase
Redis      BullMQ queue          → Railway Redis / Upstash
Pinecone   vectors               → Pinecone (index dimension 1536, metric cosine)
S3         uploaded files        → AWS S3 / Cloudflare R2
Email      verification + reset  → Resend
```

The backend is a long-running process (BullMQ worker, OCR, webhooks), so it
cannot run on Vercel serverless.

---

## 0. The one decision to make first: domains

The refresh cookie is `httpOnly`, `Secure`, `SameSite=strict`. The frontend
and API **must share one registrable domain**, e.g.

- `app.yourdomain.com` → Vercel
- `api.yourdomain.com` → Railway

If you use the default `*.vercel.app` + `*.up.railway.app` URLs instead, login
works, but every page reload logs the user out (the browser never sends the
cookie cross-site). Buy or choose the domain on day 1; DNS can take time.

---

## 1. Accounts and keys to collect (do this first, it has the most lead time)

| Service | What you need | Required? |
|---|---|---|
| Anthropic | `ANTHROPIC_API_KEY` | Yes: chat answers |
| OpenAI | `OPENAI_API_KEY` (embeddings, `text-embedding-3-small`) | Yes, with the default `EMBEDDING_PROVIDER=openai` |
| Pinecone | `PINECONE_API_KEY`, and an index with **dimension 1536** | Yes |
| S3 / R2 | endpoint, access key, secret, bucket | Yes |
| Resend | `RESEND_API_KEY` + a **verified sending domain** for `EMAIL_FROM` | Yes: users must verify email before they can upload or chat |
| Cohere | `COHERE_API_KEY` | Optional: reranking; falls back to vector order without it |
| NMI | `NMI_PRIVATE_API_KEY`, `NMI_WEBHOOK_SECRET`, Collect.js key | Only if paid plans are live on day 1 |
| Sentry | `SENTRY_DSN` | Recommended: backend errors are reported when set |
| Railway | project + `RAILWAY_TOKEN` GitHub secret | Yes |
| Vercel | project linked to the GitHub repo | Yes |

---

## 2. Backend → Railway

1. New Railway project → **Deploy from GitHub repo** → set the service's
   **Root Directory to `backend`**. Name the service `docwise-backend` (the
   GitHub workflow deploys to that name).
2. Add **Postgres** and **Redis** plugins to the same project.
3. `backend/railway.json` already sets:
   - build: `npm run build` (runs `prisma generate && tsc`)
   - start: `npm run start:prod` (runs `prisma migrate deploy`, then starts the server)
   - health check: `GET /healthz`
4. Set the environment variables:

```env
NODE_ENV=production
# PORT is injected by Railway — do not set it.

DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

FRONTEND_URL=https://app.yourdomain.com
BACKEND_PUBLIC_URL=https://api.yourdomain.com
CORS_ORIGINS=https://app.yourdomain.com

JWT_ACCESS_SECRET=<openssl rand -hex 48>
JWT_REFRESH_SECRET=<a different openssl rand -hex 48>

S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com   # or https://s3.<region>.amazonaws.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=docwise-prod
S3_REGION=auto                                           # or your AWS region

PINECONE_API_KEY=...
PINECONE_INDEX=docwise-prod

ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-5        # optional; claude-sonnet-5-5 is the newer Sonnet at the same price
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=...
COHERE_API_KEY=...                     # optional

RESEND_API_KEY=re_...                  # sent via Resend SMTP; or set SMTP_HOST/PORT/USER/PASS/SECURE instead
EMAIL_FROM=DocWise <noreply@yourdomain.com>   # must be on a domain verified in Resend

SENTRY_DSN=...                         # optional

# Billing (only if live on day 1)
NMI_PRIVATE_API_KEY=...
NMI_WEBHOOK_SECRET=...
NMI_PLAN_STARTER=STARTER
NMI_PLAN_PRO=PRO
```

5. Settings → Networking → add the custom domain `api.yourdomain.com` and create the CNAME it shows you.
6. Check: `https://api.yourdomain.com/healthz` → `{"ok":true}` and `/readyz` → `{"ok":true}` (the database is reachable).

---

## 3. Frontend → Vercel

1. Import the repo → **Root Directory: `frontend`** (framework auto-detected as Next.js).
2. Environment variables (Production + Preview), then **redeploy**, because `NEXT_PUBLIC_*` values are baked in at build time:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` (the origin; a trailing `/api` is also accepted) |
| `NEXT_PUBLIC_NMI_COLLECT_JS_KEY` | NMI public key (only if billing is live) |

3. Add the custom domain `app.yourdomain.com`.

---

## 4. Post-deploy wiring

- NMI webhook (if billing is live): `https://api.yourdomain.com/api/webhooks/nmi`, with signing secret = `NMI_WEBHOOK_SECRET`.
- Create your admin account: register and verify through the UI, then promote that user in the production database:
  `UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@yourdomain.com';`
  **Do not run `backend/create-admin.js` against production.** It creates `admin@docwise.ai` with the hardcoded password `admin12345`.
- GitHub → Settings → Secrets → `RAILWAY_TOKEN`, so pushes to `main` redeploy the backend (`.github/workflows/main.yml`).

---

## 5. Launch-day smoke test (about 10 minutes, on the real domain)

```text
[ ] https://app.yourdomain.com loads
[ ] Register → verification email arrives (check spam) → link opens /verify-email → lands on /dashboard
[ ] Yellow "verify your email" banner is gone
[ ] Hard-reload /chat → still logged in (proves the cookie/domain setup)
[ ] Upload a PDF → status reaches READY
[ ] "Try sample documents" → ask a question → answer streams, with citations
[ ] Click a citation → PDF opens at the highlighted passage
[ ] /compare on two ready docs returns differences
[ ] Logout → login works
[ ] (billing) NMI test subscription → plan updates
[ ] (Sentry) a test error shows up
```

`SMOKE_BASE_URL=https://api.yourdomain.com npm run smoke:e2e` (repo root) checks `/healthz` and that login rejects bad credentials.

---

## 6. Rollback

1. Railway → service → Deployments → **Redeploy** the previous healthy deployment. Vercel → Deployments → previous → **Promote to Production**.
2. Prisma migrations only add things in this release; rolling back the app does not require rolling back the database. Take a Postgres snapshot before the first production migrate anyway.
3. Re-run the smoke checks in §5 (`/healthz`, login, one document question).
4. Record what happened in `docs/NOTES.md`.

---

## 7. Suggested schedule to 19 Oct

| Day | Work |
|---|---|
| Mon 13 | Buy/choose the domain; create the Anthropic, OpenAI, Pinecone, S3/R2, Resend and Sentry accounts; start Resend domain verification (DNS) |
| Tue 14 | Railway backend + Postgres + Redis; `/healthz` and `/readyz` green |
| Wed 15 | Vercel frontend; custom domains; run the full §5 smoke test |
| Thu 16 | Fix anything the smoke test finds; decide whether NMI billing is in or out for day 1 |
| Fri 17 | Upload 10–20 real documents of your own; check answer quality and speed |
| Sat 18 | Freeze code; final smoke test; snapshot the database |
| Sun 19 | Launch 🚀 and watch Sentry and Railway logs for the first hours |
