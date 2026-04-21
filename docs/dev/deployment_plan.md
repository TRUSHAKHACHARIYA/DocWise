# 🚀 DocWise Production Deployment Plan

This document outlines the steps to move DocWise from local development to a production-ready environment.

## 🏗️ Infrastructure Stack

| Component | Development | Production (Recommended) |
| :--- | :--- | :--- |
| **Database** | SQLite (`dev.db`) | **PostgreSQL** (Supabase or Neon) |
| **Vector DB** | Pinecone (Starter) | **Pinecone** (Serverless/Pro) |
| **Frontend** | Next.js (Local) | **Vercel** |
| **Backend** | Fastify (Local) | **Railway** or **Render** |
| **File Storage** | Local / S3 Mock | **AWS S3** or **Cloudflare R2** |
| **Monitoring** | Console Logs | **Sentry** + **Logtail** |

---

## 📅 Deployment Roadmap

### Phase 1: Environment & Secrets
1. **API Keys**: Replace all `dummy-` keys in `.env` with production keys from:
   - OpenAI (Embeddings)
   - Anthropic (Claude 3.5 Sonnet)
   - Pinecone (Vector Index)
   - Stripe (Live Mode Prices)
   - Resend (Email Sending Domain)

### Phase 2: Database Migration
1. Set up a **PostgreSQL** instance.
2. Update `DATABASE_URL` in `backend/.env`.
3. Update `schema.prisma` provider to `postgresql` (if not already handled via env).
4. Run `npx prisma migrate deploy` to set up the production tables.

### Phase 3: Backend Deployment (Railway)
1. Connect your GitHub repository to **Railway**.
2. Configure the `root` directory as `/backend`.
3. Add all environment variables from `.env`.
4. Railway will automatically detect the `package.json` and run `npm run build` & `npm start`.

### Phase 4: Frontend Deployment (Vercel)
1. Connect your GitHub repository to **Vercel**.
2. Configure the `root` directory as `/frontend`.
3. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL.
4. Deploy!

### Phase 5: Domain & SSL
1. Configure custom domains (e.g., `app.docwise.ai`).
2. Set up SSL certificates (automated via Vercel/Railway).
3. Update Stripe Webhook URLs in the Stripe Dashboard to point to your production backend.

---

## 🛡️ Pre-Launch Checklist
- [ ] Run `npm run build` in both folders to ensure zero compilation errors.
- [ ] Run the RAG Evaluation script with real keys to verify answer quality.
- [ ] Perform a test transaction in Stripe (Test Mode) using the live backend URL.
- [ ] Verify that document uploads are being stored in the production S3 bucket.

> [!IMPORTANT]
> Change your `JWT_SECRET` and `DATABASE_URL` immediately if they were ever committed to a public repository!
