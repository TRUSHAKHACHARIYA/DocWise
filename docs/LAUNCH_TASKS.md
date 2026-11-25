# DocWise Launch Task List (target: Monday 30 Nov 2026)

The launch code is on branch `ccr-3615d6f6-xmfse1` (clean, rebuilt from the pre-attack commits of PR #45). CI is green.
What's left is the security clean-up, account setup, deployment and checks only you can do.
Full step-by-step instructions are in [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md).

---

## 0. Security incident clean-up (do first: Wed 25 Nov)

On 5 Nov and 13 Nov a stolen GitHub credential was used to force-push rewritten commits onto
`master`, `claude/code-review-improvements-5vraw5`, `claude/dazzling-davinci-311br4`,
`feat/phase-b-workspaces-folders` and `feat/product-roadmap-phases`. The rewrites kept the original
author, date and message but added an obfuscated JavaScript payload (`init` files run by
`node init` in package.json scripts, code hidden after spaces in `postcss.config.mjs`, and a hidden
`.vscode/tasks.json` that runs a fake font file when the folder is opened). `main` was **not** affected.

- [ ] **Do not merge PR #45** (its branch is infected) and do not run `npm run dev/build` or open any of the 5 branches in VS Code
- [ ] If you opened one of those branches in VS Code or ran `npm run dev/build` on it after 5 Nov: treat that computer as compromised. Run a malware scan and change passwords from a different, clean device
- [ ] GitHub → Settings → Password and authentication: change your password, turn on 2FA, sign out all sessions
- [ ] GitHub → Settings → Developer settings: **revoke all personal access tokens** and review OAuth apps and SSH keys
- [ ] Rotate every secret that was on an affected machine or in a `.env` file (API keys, JWT secrets, database URLs, `RAILWAY_TOKEN`)
- [ ] Restore or delete the 5 infected branches (the original clean commits are still on GitHub)
- [ ] GitHub → repo Settings → Rules: protect `main` (require PRs, block force pushes)
- [x] CI now runs `scripts/check-integrity.mjs`, which fails the build if this payload pattern reappears

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
- [x] Remove the malware and rebuild the launch work on a clean branch
- [ ] **Open a new PR from the clean branch and merge it into `main`** (not PR #45)

---

## 2. Accounts and keys: Wed 25 Nov

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

## 3. Backend on Railway: Thu 26 Nov

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

## 4. Frontend on Vercel: Thu 26 Nov

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

## 5. Launch-day test: Fri 27 Nov (repeat Sun 29 Nov)

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

## 6. Decisions and reviews: Fri 27 Nov

- [ ] Decide: **are paid plans live on day 1?**
  - If yes: add the NMI keys (`NMI_PRIVATE_API_KEY`, `NMI_WEBHOOK_SECRET`, `NEXT_PUBLIC_NMI_COLLECT_JS_KEY`), set the webhook to `https://api.yourdomain.com/api/webhooks/nmi`, and test a subscription
  - If no: leave NMI unset; everyone stays on Free and Trial
- [ ] Have `/privacy` and `/terms` reviewed for your country (they're a starting text, not legal advice)
- [ ] Fix anything the launch-day test found

---

## 7. Quality check: Sat 28 Nov

- [ ] Upload 10–20 real documents of the kind your users will use
- [ ] Ask realistic questions; check that the answers and citations are correct
- [ ] Check response speed and that large or scanned PDFs finish processing

---

## 8. Freeze: Sun 29 Nov

- [ ] No more code changes
- [ ] Run the full launch-day test (§5) again
- [ ] Take a Postgres backup / snapshot
- [ ] Note the current Railway and Vercel deployments (for rollback)

---

## 9. Launch: Mon 30 Nov 🚀

- [ ] Announce
- [ ] Watch Sentry and the Railway logs for the first few hours
- [ ] If something breaks: roll back (`DEPLOYMENT_GUIDE.md` §6) → redeploy the previous Railway deployment and promote the previous Vercel deployment

---

## 10. After launch (not needed for 30 Nov)

| Task | Size |
|---|---|
| Cancel a subscription at the end of the billing period, instead of immediately | Small |
| Extra marketing pages (use cases, security, competitor comparisons) | Small–Medium |
| One-click briefing generator and tracking of which citations people click | Medium |
| Clean up the `canvas` package behind the last `npm audit` critical (build step only, not the running app) | Medium |
| Run document processing as its own Railway service (when traffic grows) | Medium |
| Team sharing: workspace members and document permissions | Large |
