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

### API and Config
- Frontend API base URL handling is centralized in one shared helper.
- Backend environment variables are validated with a Zod schema at startup.
- CORS is restricted to an explicit allowlist instead of reflecting every origin.

### Chat and Document Flow
- Chat session document links now validate ownership before saving.
- Duplicate document links are deduplicated before write.
- Session rename updates now use the latest store state instead of a stale closure.

## Suggested Next Steps

### 1. PostgreSQL Migration
- Move the current SQLite-backed metadata store to PostgreSQL for better concurrency and production resilience.

### 2. Stronger Queue Ops
- Add a small admin or internal view for the dead-letter queue so failed ingestion jobs are easy to triage.
- Track retry counts and failure reasons in the UI so users can understand document processing state.

### 3. Smarter Ingestion
- Add token-based chunking for more precise context sizing.
- Add OCR support for scanned documents and image-heavy PDFs.

### 4. Better UX
- Stream ingestion progress to the UI so users can see parsing and embedding stages in real time.
- Add PDF citation jump-to-source behavior for chat answers.

### 5. Search and Retrieval
- Explore hybrid search or metadata-aware retrieval for queries that mix semantic search with filters.

Last Updated: April 23, 2026
