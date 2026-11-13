# DocWise Launch Task List (target: Sunday 19 Oct 2026)

All code needed for launch is in PR [#45](https://github.com/TRUSHAKHACHARIYA/DocWise/pull/45), and CI is green.
What's left is account setup, deployment and checks only you can do.
Full step-by-step instructions are in [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md).

---

## 1. Code (done)

- [x] Fix `npm ci` failing on Linux (Vercel / Railway / CI)
- [x] Fix verification emails never being sent (`RESEND_API_KEY` now works)
- [x] Fix the "verify your email" banner never clearing
- [x] Fix `/api/api/...` 404s when `NEXT_PUBLIC_API_URL` ends in `/api`
- [x] Re-enable Sentry error reporting (backend + optional frontend)
- [x] Make the chat page load faster (2.15 MB → 142 kB)
- [x] Railway config: run migrations on start, `/healthz` health check
- [x] Privacy Policy and Terms pages, linked from the footer and the sign-up form
- [x] Make `create-admin.js` safe (no hardcoded `admin12345` password)
- [x] Rewrite the deployment guide as a launch runbook
- [ ] **Approve and merge PR #45 into `main`**

---

## 2. Accounts and keys: Mon 13 Oct

- [ ] Buy or choose a domain (e.g. `yourdomain.com`)
- [ ] **Anthropic**: create an API key → `ANTHROPIC_API_KEY`
- [ ] **OpenAI**: create an API key → `OPENAI_API_KEY` (used for embeddings)
- [ ] **Pinecone**: create an index with **dimension 1536, metric cosine** → `PINECONE_API_KEY`, `PINECONE_INDEX`
- [ ] **S3 or Cloudflare R2**: create a bucket and access keys → `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- [ ] **Resend**: create an API key → `RESEND_API_KEY`
- [ ] **Resend**: start verifying your sending domain today (DNS can take a while) → `EMAIL_FROM=DocWise <noreply@yourdomain.com>`
- [ ] Generate two different secrets with `openssl rand -hex 48` → `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- [ ] Optional: **Sentry** project → `SENTRY_DSN` (backend) and `NEXT_PUBLIC_SENTRY_DSN` (frontend)
- [ ] Optional: **Cohere** API key → `COHERE_API_KEY` (better search ranking)

---

## 3. Backend on Railway: Tue 14 Oct

- [ ] New Railway project → deploy from the GitHub repo → **Root Directory `backend`**, service name `docwise-backend`
- [ ] Add the **Postgres** and **Redis** plugins
- [ ] Set all backend environment variables (full list in `DEPLOYMENT_GUIDE.md` §2)
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL=https://app.yourdomain.com`
  - [ ] `BACKEND_PUBLIC_URL=https://api.yourdomain.com`
  - [ ] `CORS_ORIGINS=https://app.yourdomain.com`
- [ ] Add the custom domain `api.yourdomain.com` and create its DNS record
- [ ] Check `https://api.yourdomain.com/healthz` → `{"ok":true}`
- [ ] Check `https://api.yourdomain.com/readyz` → `{"ok":true}`
- [ ] GitHub → Settings → Secrets → add `RAILWAY_TOKEN` (auto-deploys on push to `main`)

---

## 4. Frontend on Vercel: Wed 15 Oct

- [ ] Import the repo into Vercel → **Root Directory `frontend`**
- [ ] Set the environment variables:
  - [ ] `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
  - [ ] `NEXT_PUBLIC_COMPANY_NAME`
  - [ ] `NEXT_PUBLIC_SUPPORT_EMAIL`
  - [ ] `NEXT_PUBLIC_GOVERNING_LAW`
  - [ ] Optional: `NEXT_PUBLIC_SENTRY_DSN`
- [ ] Add the custom domain `app.yourdomain.com`
- [ ] Redeploy after setting variables (they're baked in at build time)

> ⚠️ The frontend and API **must** share one domain (`app.` + `api.`). On the default `vercel.app` / `railway.app` addresses, users are logged out on every page reload.

---

## 5. Launch-day test: Wed 15 Oct (repeat Sat 18 Oct)

- [ ] `https://app.yourdomain.com` loads
- [ ] Register → the verification email arrives (check spam)
- [ ] Click the email link → lands on the dashboard; the yellow banner is gone
- [ ] Reload `/chat` → still logged in
- [ ] Upload a PDF → its status reaches READY
- [ ] "Try sample documents" → ask a question → the answer streams in with citations
- [ ] Click a citation → the PDF opens at the highlighted passage
- [ ] `/compare` on two documents shows differences
- [ ] Forgot password → reset email → new password works
- [ ] Logout → login works
- [ ] `/privacy` and `/terms` open from the footer
- [ ] Make yourself an admin: `railway run node create-admin.js you@yourdomain.com`
- [ ] Optional: trigger a test error and confirm it shows in Sentry

---

## 6. Decisions and reviews: Thu 16 Oct

- [ ] Decide: **are paid plans live on day 1?**
  - If yes: add the NMI keys (`NMI_PRIVATE_API_KEY`, `NMI_WEBHOOK_SECRET`, `NEXT_PUBLIC_NMI_COLLECT_JS_KEY`), set the webhook to `https://api.yourdomain.com/api/webhooks/nmi`, and test a subscription
  - If no: leave NMI unset; everyone stays on Free and Trial
- [ ] Have `/privacy` and `/terms` reviewed for your country (they're a starting text, not legal advice)
- [ ] Fix anything the launch-day test found

---

## 7. Quality check: Fri 17 Oct

- [ ] Upload 10–20 real documents of the kind your users will use
- [ ] Ask realistic questions; check that the answers and citations are correct
- [ ] Check response speed and that large or scanned PDFs finish processing

---

## 8. Freeze: Sat 18 Oct

- [ ] No more code changes
- [ ] Run the full launch-day test (§5) again
- [ ] Take a Postgres backup / snapshot
- [ ] Note the current Railway and Vercel deployments (for rollback)

---

## 9. Launch: Sun 19 Oct 🚀

- [ ] Announce
- [ ] Watch Sentry and the Railway logs for the first few hours
- [ ] If something breaks: roll back (`DEPLOYMENT_GUIDE.md` §6) → redeploy the previous Railway deployment and promote the previous Vercel deployment

---

## 10. After launch (not needed for 19 Oct)

| Task | Size |
|---|---|
| Cancel a subscription at the end of the billing period, instead of immediately | Small |
| Extra marketing pages (use cases, security, competitor comparisons) | Small–Medium |
| One-click briefing generator and tracking of which citations people click | Medium |
| Clean up the `canvas` package behind the last `npm audit` critical (build step only, not the running app) | Medium |
| Run document processing as its own Railway service (when traffic grows) | Medium |
| Team sharing: workspace members and document permissions | Large |
