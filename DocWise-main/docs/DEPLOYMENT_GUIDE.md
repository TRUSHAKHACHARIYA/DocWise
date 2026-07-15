# 🚀 DocWise Production Deployment Guide (Day 29)

This guide outlines the environment variables and external configurations needed to launch DocWise in production.

## 1. Backend Deployment (Railway)

Set these variables in your Railway project settings:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Your production PostgreSQL connection string. |
| `PORT` | Set to `8080` (Railway will provide this automatically). |
| `FRONTEND_URL` | The URL of your Vercel deployment (e.g., `https://docwise.vercel.app`). |
| `JWT_ACCESS_SECRET` | A long, random string for signing access tokens. |
| `JWT_REFRESH_SECRET` | A long, random string for signing refresh tokens. |
| `NMI_PRIVATE_API_KEY` | Your **Live Mode** NMI Secret Key. |
| `NMI_WEBHOOK_SECRET` | The webhook secret from NMI dashboard (after setting up the production webhook). |
| `NMI_PLAN_STARTER` | The Price ID for your Starter plan in NMI. |
| `NMI_PLAN_PRO` | The Price ID for your Pro plan in NMI. |
| `OPENAI_API_KEY` | Your production OpenAI key. |
| `CLAUDE_API_KEY` | Your production Anthropic key. |
| `COHERE_API_KEY` | Your production Cohere key (for reranking). |
| `PINECONE_API_KEY` | Your production Pinecone key. |
| `PINECONE_ENVIRONMENT` | e.g. `us-east-1-aws`. |
| `PINECONE_INDEX` | Name of your production index. |

### Post-Deployment Step:
1. Go to NMI Dashboard -> Developers -> Webhooks.
2. Add an endpoint: `https://your-backend-url.railway.app/api/webhooks/nmi`.
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
4. Copy the "Signing Secret" and update `NMI_WEBHOOK_SECRET` in Railway.

---

## 2. Frontend Deployment (Vercel)

Set these variables in your Vercel project settings:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.railway.app/api` |
| `NEXT_PUBLIC_NMI_COLLECT_JS_KEY` | Your **Live Mode** NMI Publishable Key. |

### Post-Deployment Step:
1. Ensure your Vercel URL is added to the `FRONTEND_URL` in Railway.
2. Ensure you have added the domain to the NMI "Whitelisted Domains" in the checkout settings if strictly required.

---

## 3. Database Migration
In production, you'll need to run the following command once your `DATABASE_URL` is set:
```bash
npx prisma migrate deploy
```
*Note: The GitHub Action is configured to run tests, but manual migration might be needed for the first setup.*

---

## 4. Monitoring (Sentry)
Create a project on Sentry.io and add `SENTRY_DSN` to both environments for automatic error tracking.

---

## 5. Rollback Plan
1. Keep the previous stable release artifact available in Railway and Vercel.
2. If production health checks fail, rollback both backend and frontend to the previous release SHA.
3. Re-run smoke checks (`/healthz`, login endpoint, and one document query flow).
4. Capture incident notes and follow-up actions in `docs/NOTES.md`.


