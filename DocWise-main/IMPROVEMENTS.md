# DocWise Project Roadmap & Improvements

This document tracks completed improvements and the next highest-value follow-ups for DocWise.

## Completed Improvements

### Security and Auth
- Access tokens are kept in memory only and never written to `localStorage`.
- Refresh tokens are handled with `httpOnly` cookies.
- Login uses rate limiting to reduce brute-force attempts.
- The client uses credentialed requests so cookie-based auth works consistently.
- SSRF protection blocks requests to private/reserved IP ranges and localhost.
- Prompt injection defense: retrieved content wrapped in XML tags with system-prompt instructions.
- Webhook idempotency prevents duplicate event processing.

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
- BullMQ jobs pass S3 keys instead of full file buffers to reduce Redis memory usage.

### API and Config
- Frontend API base URL handling is centralized in one shared helper.
- Backend environment variables are validated with a Zod schema at startup.
- CORS is restricted to an explicit allowlist instead of reflecting every origin.
- Claude model string centralized in env config for easy upgrades.
- Voyage AI embedding provider correctly keyed with dedicated `VOYAGE_API_KEY`.

### Chat and Document Flow
- Chat session document links now validate ownership before saving.
- Duplicate document links are deduplicated before write.
- Session rename updates now use the latest store state instead of a stale closure.
- Usage limit checks are now atomic (conditional SQL UPDATE) to prevent race conditions.

### Search and Retrieval
- Postgres full-text search (tsvector + GIN index) replaces LIKE keyword fallback.
- Keyword match scores use ts_rank relevance instead of arbitrary fixed scores.

### Code Quality
- All services unified to use structured logger (`utils/logger.ts`).
- Admin and self-service user deletion share a single `cleanupUserData` path.
- Unused CSRF plugin removed (Bearer + sameSite=strict cookies already provide CSRF protection).

## Suggested Next Steps

### 1. Team/Organization Layer
- Add Organization and Membership models for multi-tenant team support.
- Org-scoped document/chat/API-key access controls.
- Invite flow, org admin panel, and org-level billing.

### 2. Enterprise/Legal Buyer Readiness
- Written data retention and deletion policy.
- Encryption-at-rest documentation for S3/R2 and Postgres.
- Trust/security page with sub-processor list and incident contact.
- SOC 2 roadmap statement.
- DPA template ready on request.

### 3. Design and Polish
- Accessibility audit (contrast, focus states, ARIA labels).
- Empty/loading/error state polish across all pages.
- Mobile responsiveness pass on the 3-panel chat workspace.
- Dark mode consistency check.

### 4. Additional Features
- Document comparison mode for version diffing.
- Answer confidence indicators from retrieval/rerank scores.
- Conversation-level export as cited PDF/Markdown.
- Semantic caching for repeated questions.
- Google Drive / SharePoint / Notion import integrations.
- Slack/Teams bot integration.

Last Updated: July 15, 2026
