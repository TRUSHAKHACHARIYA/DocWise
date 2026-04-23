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

## Suggested Next Steps

### 1. PostgreSQL Migration
- Move the current SQLite-backed metadata store to PostgreSQL for better concurrency and production resilience.


### 3. Smarter Ingestion
- Add token-based chunking for more precise context sizing.

### 4. Better UX
- Add PDF citation jump-to-source behavior for chat answers.

### 5. Search and Retrieval
- Explore hybrid search or metadata-aware retrieval for queries that mix semantic search with filters.

Last Updated: April 23, 2026
