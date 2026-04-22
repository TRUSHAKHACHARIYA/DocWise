# DocWise Project Roadmap & Improvements

This document tracks the security, performance, and feature improvements made to the DocWise platform, as well as the planned roadmap for future development.

## ✅ Completed Improvements (Security & Stabilty Audit)

### 1. Security & Authentication
- **In-Memory Tokens**: Access tokens are now stored in Zustand memory only, never in `localStorage` (XSS Mitigation).
- **HttpOnly Cookies**: Refresh tokens are now handled via secure, `httpOnly`, `sameSite: 'strict'` cookies.
- **PII Protection**: User profile data is no longer persisted in `localStorage`.
- **Brute-Force Protection**: Added a 5-attempts/min rate limit to the login endpoint.
- **CSRF Preparation**: Added `withCredentials: true` to the Axios client configuration.

### 2. RAG Pipeline Logic
- **Fixed Overlap Bug**: The sliding window chunker now correctly maintains context overlap even when custom separators are found.
- **SSE Stream Fix**: Resolved a "double-[DONE]" signal bug that caused race conditions in the client-side decoder.
- **Input Sanitization**: Added strict Zod validation (1-4000 chars) for all chat messages to prevent API abuse.
- **Improved Estimation**: Adjusted character-to-token ratios to better reflect LLM context windows (~3.5 chars/token).

### 3. Reliability
- **Asynchronous Ingestion**: Moved PDF/URL ingestion to background tasks. The API returns a `201 PROCESSING` status immediately, preventing HTTP timeouts for large documents.
- **UI Stabilty**: Resolved broken imports in the Admin Dashboard (`PieChart`, `AreaChart`, etc.) and fixed the `ErrorBoundary` children rendering bug.

### 4. API Standardization
- **BaseURL Alignment**: Centralized the `/api` prefix in the Axios client, removing redundant prefixes in the `useDocuments` and `useUsage` hooks.

---

## 🚀 Future Roadmap (High Priority)

### 1. Robust Job Queuing
- **Switch to BullMQ**: Replace the current fire-and-forget async ingestion with a Redis-backed BullMQ queue.
- **Why**: Allows for retries on failed parsing, concurrency management, and job persistence if the server restarts.

### 2. Token-Based Chunking
- **Library**: Integrate `js-tiktoken`.
- **Why**: Character counting is an approximation. Token-based chunking ensures exactly 512 or 1024 tokens, maximizing LLM context efficiency and reducing costs.

### 3. Hybrid Search Enhancements
- **PGVector Support**: If moving away from Pinecone, implement PGVector in the primary database.
- **Self-Querying**: Use Claude to translate natural language questions into structured metadata filters (e.g., "Find docs from last week about Apple").

### 4. Advanced UX/UI
- **Real-time Progress**: Use WebSockets or SSE to stream the parsing progress (e.g., "Parsing Page 5/20...", "Generating Embeddings...").
- **PDF Citation Highlights**: Click a source citation in the chat to open the PDF viewer and automatically scroll to/highlight the relevant paragraph.

### 5. Multi-Modal Intelligence
- **Vision Support**: Enable Claude 3.5 Sonnet to "see" images and charts within PDFs.
- **OCR Engine**: Add Tesseract or AWS Textract support for scanned or image-based documents.

---

## 🛠 Second Wave: Infrastructure & Scalability Findings

The following areas were identified during the second deep-dive for production readiness:

### 1. Infrastructure & Reliability
- **PostgreSQL Migration**: Move from SQLite to PostgreSQL to handle high-concurrency SaaS workloads.
- **Async Logging (Pino)**: Replace synchronous `fs.appendFileSync` with `pino` for non-blocking JSON logging.
- **API-based Email**: Transition from SMTP to a reliable provider like Resend or Postmark for transactional emails.

### 2. Advanced Document Intelligence
- **Dynamic Scraping (Playwright)**: Upgrade `cheerio` to `Playwright` to support ingesting content from JS-heavy SPA websites.
- **Error Reason Tracking**: Add an `errorMessage` field to the Document model to show users specifically *why* an ingestion failed.
- **Cross-Doc Summaries**: Implement a "Summary Layer" in the vector store for global queries like "Which documents discuss X?".

### 3. UI/UX & Auth Hardening
- **OAuth Integration**: Add Google and GitHub social login support.
- **Form Management**: Refactor auth forms to use `React Hook Form` + `Zod` for better validation and type safety.
- **Command Palette**: Implement a `CMD+K` interface for rapid navigation across the app.

---

*Last Updated: April 2026*
