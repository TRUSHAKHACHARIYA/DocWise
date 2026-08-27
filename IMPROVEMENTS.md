# DocWise Project Roadmap & Improvements

This document tracks completed improvements and the next highest-value follow-ups for DocWise.

## Completed Improvements

### Security and Auth
- Access tokens are kept in memory only and never written to `localStorage`.
- Refresh tokens are handled with `httpOnly` cookies.
- Login uses rate limiting to reduce brute-force attempts.
- The client uses credentialed requests so cookie-based auth works consistently.

### Reliability
- Document and URL ingestion run in the background instead of blocking the request.
- Ingestion now uses BullMQ retries with exponential backoff.
- Failed ingestion jobs are also written to a dead-letter queue for later inspection.
- Ingestion failures now surface as failures instead of being swallowed silently.
- Added Admin Triage view for the ingestion dead-letter queue with manual retry support.
- Document ingestion now tracks failure reasons and retry counts in the database and UI.
- Implemented scanned document detection for PDFs to provide clearer error feedback.
- Streamed real-time ingestion progress (percentage and detailed status) to the UI.
- Integrated `tesseract.js` for OCR support on images (PNG, JPG, WEBP).

### API and Config
- Frontend API base URL handling is centralized in one shared helper.
- Backend environment variables are validated with a Zod schema at startup.
- CORS is restricted to an explicit allowlist instead of reflecting every origin.

### Chat and Document Flow
- Chat session document links now validate ownership before saving.
- Duplicate document links are deduplicated before write.
- Session rename updates now use the latest store state instead of a stale closure.

### Reliability and Security (code review pass)
- Ingestion is now idempotent on retry: `processTextIngestion` clears any chunks/vectors a prior attempt wrote before re-inserting, so BullMQ retries and dead-letter "retry" no longer duplicate chunk rows or leave stale vectors behind.
- Embedding requests are now batched (64 chunks per call) so large documents no longer fail deterministically against provider per-request input limits (e.g. Cohere's 96-text cap).
- Fixed account deletion leaving the `refresh_token` httpOnly cookie behind — it was clearing the wrong cookie name/path, unlike `/api/auth/logout`.
- `retriever.ts` now scopes the document-name lookup to the requesting user, closing a defense-in-depth gap for any future caller that feeds it less-trusted document IDs.
- Removed unused `middleware/adminOnly.ts`, a dead duplicate of `requireAdmin` that skipped the `requireAuth` chain — a landmine if it were ever wired up.
- The frontend axios client now dedupes concurrent 401 responses into a single `/auth/refresh` call instead of racing multiple refresh requests.

## Suggested Next Steps

### 1. CSRF protection is registered but unused
`@fastify/csrf-protection` is registered in `app.ts` but no route applies its preHandler, so it currently protects nothing. Risk is largely mitigated by `sameSite: strict` on the refresh cookie plus bearer-token auth for all other endpoints, but it should either be wired up on cookie-authenticated routes or removed to avoid a false sense of protection.

### 2. Better UX
- Add PDF citation jump-to-source behavior for chat answers.

### 3. Search and Retrieval
- Explore hybrid search or metadata-aware retrieval for queries that mix semantic search with filters.

Last Updated: August 27, 2026
=======
### Product (2026)
- **3-panel citation workspace**: documents sidebar, chat thread, and embedded PDF citation panel with source highlighting.
- **Fast onboarding**: sample MSA and security policy documents plus suggested prompt chips on chat.
- **Document comparison**: select two ready documents and get a cited summary of differences (`/compare`).
- **Landing page**: homepage, hero, and auth marketing copy aligned to shipped features (citations, compare, onboarding).
- **Workspaces & folders**: named workspaces, folders, document organization, and folder filters on Documents.
- **Source-only chat mode**: per-session toggle for stricter grounding from retrieved passages only.
- **PostgreSQL**: production-ready metadata store with Prisma migrations (local via Docker Compose).
- **Token-based chunking**: 512-token chunks with overlap for improved retrieval.

## Suggested Next Steps

### 1. Briefing & Analytics
- One-click briefing generator and citation click analytics.

### 2. GTM Pages
- Dedicated use-case, security, and competitor comparison landing pages.

### 3. Team Sharing
- Shared workspace members and document-level permissions.

### 4. Search and Retrieval
- Explore hybrid search or metadata-aware retrieval for queries that mix semantic search with filters.

Last Updated: June 25, 2026
