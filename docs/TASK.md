# TASK.md — 30-Day Development Plan

> Target: Working MVP in 30 days. Strategy: UI/UX first, then wire in backend.

---

## Phase Overview

```
Week 1 (Days 1–7):   UI/UX Design & Frontend Skeleton
Week 2 (Days 8–14):  Backend Core + Database + Auth
Week 3 (Days 15–21): RAG Pipeline + Chat Functionality
Week 4 (Days 22–30): Billing + Testing + Polish + Deploy
```

---

## WEEK 1 — UI/UX Design & Frontend Skeleton

### Day 1 — Design System & Project Setup

**Morning:**
- [ ] Initialize Next.js 14 project with TypeScript
  ```bash
  npx create-next-app@latest frontend --typescript --tailwind --app
  ```
- [ ] Set up Tailwind config with custom design tokens
- [ ] Install dependencies: `shadcn/ui`, `zustand`, `axios`, `lucide-react`
- [ ] Create folder structure per ARCHITECTURE.md
- [ ] Push initial commit to GitHub

**Afternoon:**
- [ ] Design color palette & typography in `tailwind.config.js`
- [ ] Build base UI components: `Button`, `Input`, `Badge`, `Spinner`, `Toast`
- [ ] Create `globals.css` with CSS variables

**GitHub commit:** `feat: project setup and design system`
**Branch:** `feature/ui-design-system` → PR to `dev`

---

### Day 2 — Landing Page

**Tasks:**
- [ ] Build landing page (`app/page.tsx`)
  - Hero section with headline + CTA
  - Features section (3-column grid)
  - Pricing section (4 plans)
  - Footer
- [ ] Make it fully responsive (mobile + desktop)
- [ ] Add smooth scroll animations (CSS only)

**GitHub commit:** `feat: landing page with responsive design`

---

### Day 3 — Auth Pages (Login + Register)

**Tasks:**
- [ ] Build `/login` page with form validation
- [ ] Build `/register` page with form validation
- [ ] Build auth layout with logo sidebar
- [ ] Add form error states and loading states
- [ ] Create `useAuth` hook (no backend yet — mock responses)

**GitHub commit:** `feat: auth pages with form validation`

---

### Day 4 — User Dashboard

**Tasks:**
- [ ] Build dashboard shell layout (sidebar + header)
- [ ] Build dashboard home page:
  - Stats cards (docs uploaded, questions asked, plan)
  - Usage bar (questions used / limit)
  - Recent chats list
  - Quick upload button
- [ ] Build sidebar navigation component
- [ ] Add user avatar dropdown menu

**GitHub commit:** `feat: user dashboard layout and home page`

---

### Day 5 — Document Manager UI

**Tasks:**
- [ ] Build `/documents` page
  - Drag-and-drop upload zone (`UploadZone.tsx`)
  - Document cards grid with status badges
  - Delete confirmation modal
  - Document search/filter
- [ ] Add upload progress indicator
- [ ] Add empty state illustration

**GitHub commit:** `feat: document manager UI`

---

### Day 6 — Chat Interface UI

**Tasks:**
- [ ] Build chat page layout:
  - Left sidebar: session list + new chat button
  - Main area: message bubbles
  - Bottom: input bar + send button
- [ ] Build `MessageBubble.tsx`:
  - User messages (right-aligned)
  - AI messages (left-aligned, markdown rendered)
  - Streaming animation (typing indicator)
- [ ] Build `SourceCard.tsx` (citation display below AI message)
- [ ] Build `ChatInput.tsx` with textarea auto-resize

**GitHub commit:** `feat: chat interface UI`

---

### Day 7 — Admin Dashboard + Polish

**Tasks:**
- [ ] Build admin layout (separate from user layout)
- [ ] Build admin pages:
  - `/admin` — overview stats
  - `/admin/users` — user table with search
  - `/admin/analytics` — usage charts (mock data)
- [ ] Review ALL pages on mobile
- [ ] Fix any responsive issues
- [ ] Add page transitions

**GitHub commit:** `feat: admin dashboard UI`
**PR:** `feature/week1-ui` → `dev` branch

---

## WEEK 2 — Backend Core + Database + Auth

### Day 8 — Backend Setup + Database

**Tasks:**
- [ ] Initialize Fastify project with TypeScript
  ```bash
  mkdir backend && cd backend
  npm init -y && npm install fastify @fastify/cors @fastify/multipart
  npm install -D typescript ts-node @types/node
  ```
- [ ] Set up Prisma with PostgreSQL
  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```
- [ ] Write schema from ARCHITECTURE.md
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Create seed file with admin user

**GitHub commit:** `feat: backend setup, Prisma schema, DB migration`

---

### Day 9 — Authentication Backend

**Tasks:**
- [ ] Install auth packages: `jsonwebtoken`, `bcrypt`, `zod`
- [ ] Build auth routes (`routes/auth.ts`):
  - `POST /auth/register` — hash password, create user, send verify email
  - `POST /auth/login` — compare hash, return JWT pair
  - `POST /auth/refresh` — verify refresh token, return new access token
  - `POST /auth/logout`
- [ ] Build JWT middleware (`middleware/auth.ts`)
- [ ] Set up Resend for email verification
- [ ] Write unit tests for auth routes

**GitHub commit:** `feat: JWT authentication with email verification`

---

### Day 10 — Connect Frontend Auth to Backend

**Tasks:**
- [ ] Update `api.ts` with Axios interceptors for JWT refresh
- [ ] Update Zustand `authStore.ts` with real API calls
- [ ] Wire up login/register forms to backend
- [ ] Test full auth flow: register → verify email → login → dashboard
- [ ] Add protected route wrapper in Next.js

**GitHub commit:** `feat: frontend-backend auth integration`

---

### Day 11 — File Upload + Storage

**Tasks:**
- [ ] Set up Cloudflare R2 (or AWS S3)
- [ ] Build `fileStorage.ts` service
- [ ] Build `POST /documents/upload` route:
  - Validate file type and size
  - Upload to R2
  - Create DB record with status=PROCESSING
  - Queue ingestion job (run synchronously for MVP)
- [ ] Build `GET /documents` and `DELETE /documents/:id`
- [ ] Connect frontend document upload to backend

**GitHub commit:** `feat: file upload to R2 and document management`

---

### Day 12 — PDF Parsing + Chunking

**Tasks:**
- [ ] Install: `npm install pdf-parse mammoth`
- [ ] Build `parser.ts`: PDF → raw text
- [ ] Build `chunker.ts`: text → 512-token chunks with 64 overlap
- [ ] Test chunking on various PDF types:
  - Academic papers (dense text)
  - Legal documents (tables + lists)
  - Manuals (headers + images)
- [ ] Handle edge cases: empty PDFs, scanned PDFs, encrypted PDFs

**GitHub commit:** `feat: PDF parsing and semantic chunking`

---

### Day 13 — Embeddings + Pinecone

**Tasks:**
- [ ] Set up Pinecone index (1536 dims, cosine similarity)
- [ ] Build `embedder.ts`: chunks → OpenAI embeddings (batched)
- [ ] Build `vectorStore.ts`: Pinecone upsert, query, delete
- [ ] Run full ingestion test: upload PDF → parse → chunk → embed → store
- [ ] Verify namespace isolation works

**GitHub commit:** `feat: OpenAI embeddings and Pinecone vector storage`

---

### Day 14 — Week 2 Integration + Testing

**Tasks:**
- [ ] End-to-end test: register → upload doc → see doc in list
- [ ] Write integration tests for document pipeline
- [ ] Fix any bugs found
- [ ] Update document status properly (PROCESSING → READY/FAILED)
- [ ] Add ingestion progress polling to frontend

**GitHub commit:** `feat: full document ingestion pipeline integrated`
**PR:** `feature/week2-backend` → `dev`

---

## WEEK 3 — RAG Pipeline + Chat

### Day 15 — Query + Retrieval

**Tasks:**
- [ ] Build `retriever.ts`:
  - Embed user question
  - Query Pinecone with userId namespace
  - Filter by score threshold (0.75)
  - Return top-5 chunks with metadata
- [ ] Test retrieval with sample questions
- [ ] Log retrieval quality to console

**GitHub commit:** `feat: semantic retrieval from Pinecone`

---

### Day 16 — Reranking

**Tasks:**
- [ ] Install Cohere SDK: `npm install cohere-ai`
- [ ] Build `reranker.ts`:
  - Retrieve topK=10 candidates
  - Rerank with Cohere → take top 5
  - Fall back to score-based if Cohere fails
- [ ] Compare results: with vs without reranking
- [ ] Document quality improvement in NOTES.md

**GitHub commit:** `feat: Cohere reranking for improved retrieval accuracy`

---

### Day 17 — LLM Integration + Streaming

**Tasks:**
- [ ] Install Anthropic SDK: `npm install @anthropic-ai/sdk`
- [ ] Build `llm.ts` with streaming Claude response
- [ ] Build `promptBuilder.ts` from PROMPT.md templates
- [ ] Build `POST /chat/sessions/:id/message` route with SSE
- [ ] Test streaming in terminal with curl

**GitHub commit:** `feat: Claude LLM integration with SSE streaming`

---

### Day 18 — Chat Sessions + History

**Tasks:**
- [ ] Build full chat session CRUD routes
- [ ] Save messages to PostgreSQL with sources JSON
- [ ] Build conversation history inclusion in prompts
- [ ] Implement usage tracking (increment `questions_used`)
- [ ] Add usage limit enforcement middleware

**GitHub commit:** `feat: chat sessions, history, and usage tracking`

---

### Day 19 — Connect Chat Frontend to Backend

**Tasks:**
- [ ] Build `useChat.ts` hook with SSE event source
- [ ] Display streaming tokens in `ChatWindow.tsx`
- [ ] Display source cards after each AI message
- [ ] Load chat history when entering existing session
- [ ] Handle errors gracefully (offline, limit reached)

**GitHub commit:** `feat: frontend chat with real-time streaming`

---

### Day 20 — Multi-Document Chat

**Tasks:**
- [ ] Allow user to select multiple docs for a session
- [ ] Add document selector in chat sidebar
- [ ] Filter Pinecone query to selected doc IDs
- [ ] Update `ChatSessionDoc` join table properly
- [ ] Test cross-document queries

**GitHub commit:** `feat: multi-document chat support`

---

### Day 21 — Week 3 Testing + Quality Check

**Tasks:**
- [ ] Run 20 diverse test questions across different PDFs
- [ ] Score answers manually (accuracy, citation quality)
- [ ] Tune prompts based on results
- [ ] Fix any hallucinations found
- [ ] Run evals script for first time

**GitHub commit:** `test: week 3 quality testing and prompt tuning`
**PR:** `feature/week3-rag` → `dev`

---

## WEEK 4 — Billing + Testing + Polish + Deploy

### Day 22 — NMI Billing

**Tasks:**
- [ ] Set up NMI account + products/prices
- [ ] Build `POST /billing/create-checkout` route
- [ ] Build `POST /webhooks/nmi` to handle subscription events
- [ ] Update user plan in DB on subscription change
- [ ] Build billing portal redirect

**GitHub commit:** `feat: NMI subscription billing`

---

### Day 23 — Connect Billing to Frontend

**Tasks:**
- [ ] Build `/billing` settings page with plan comparison
- [ ] Add upgrade prompts when usage limit is hit
- [ ] Test complete billing flow: free → paid → cancelled
- [ ] Add plan badge to dashboard header

**GitHub commit:** `feat: billing UI and upgrade flow`

---

### Day 24 — Settings + Profile

**Tasks:**
- [ ] Build `/settings` page:
  - Profile: name, email change
  - Password change
  - API key management (for Pro users)
  - Danger zone: delete account
- [ ] Build API key generation endpoint
- [ ] Connect settings forms to backend

**GitHub commit:** `feat: user settings and API key management`

---

### Day 25 — Admin Features

**Tasks:**
- [ ] Build admin users table with search + filters
- [ ] Build admin user detail page (change plan, ban user)
- [ ] Build admin analytics with real data
- [ ] Build announcement feature
- [ ] Test all admin actions

**GitHub commit:** `feat: admin dashboard with real data`

---

### Day 26 — Comprehensive Testing

**Tasks:**
- [ ] Write unit tests for all services
- [ ] Write integration tests for all routes
- [ ] Run E2E test of full user journey:
  - Register → upload → chat → billing → settings
- [ ] Run evals suite, target >80% accuracy score
- [ ] Fix all failing tests

**GitHub commit:** `test: comprehensive test suite`

---

### Day 27 — Performance + Security

**Tasks:**
- [ ] Add Redis rate limiting (100 req/15min per user)
- [ ] Add request validation with Zod schemas on all routes
- [ ] Add Helmet.js security headers
- [ ] Test file upload security (malicious file types)
- [ ] Add input sanitization
- [ ] Load test with 50 concurrent users

**GitHub commit:** `security: rate limiting, validation, headers`

---

### Day 28 — UI Polish + Mobile

**Tasks:**
- [ ] Review every page on iPhone SE (375px)
- [ ] Review on iPad (768px)
- [ ] Fix all mobile layout issues
- [ ] Add loading skeletons everywhere
- [ ] Add empty states for all lists
- [ ] Add error boundary components

**GitHub commit:** `polish: mobile responsive and loading states`

---

### Day 29 — Deployment Setup

**Tasks:**
- [ ] Set up Railway project (backend + postgres + redis)
- [ ] Set up Vercel project (frontend)
- [ ] Set up GitHub Actions CI/CD
- [ ] Configure all production env vars
- [ ] Run staging deployment + smoke test
- [ ] Set up Sentry error monitoring

**GitHub commit:** `deploy: Railway + Vercel + CI/CD setup`

---

### Day 30 — Launch Prep

**Tasks:**
- [ ] Final end-to-end testing on production
- [ ] Set up custom domain + SSL
- [ ] Write product changelog / release notes
- [ ] Create 3 test user accounts
- [ ] Merge `dev` → `main` → production deploy
- [ ] LAUNCH 🚀

**GitHub commit:** `release: v1.0.0 MVP launch`

---

## GitHub Branch Strategy

```
main         ← production only. Never push directly.
dev          ← integration branch. PRs merge here first.
staging      ← auto-syncs with dev for Railway staging
feature/*    ← your daily work branches
hotfix/*     ← emergency production fixes
```

### Daily Git Workflow

```bash
# Start of day
git checkout dev
git pull origin dev
git checkout -b feature/day-X-description

# During the day (commit often)
git add -p                    # stage specific changes
git commit -m "feat: add chunker service"

# End of day
git push origin feature/day-X-description
# Open PR on GitHub → dev branch
# Review your own PR changes
# Merge when happy
```

### Commit Message Format (Conventional Commits)

```
feat:     new feature
fix:      bug fix
test:     adding tests
refactor: code change without feature/fix
docs:     documentation
style:    formatting, missing semicolons
deploy:   deployment config
perf:     performance improvement
security: security hardening
```

