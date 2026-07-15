# NOTES.md — Developer Notes, Decisions & Gotchas

> Running log of technical decisions, problems solved, and things to remember.

---

## Architecture Decisions

### Why Fastify over Express?
- 2-3x faster throughput
- Built-in schema validation with JSON Schema
- Better TypeScript support out of box
- Plugin architecture is cleaner for large apps

### Why Pinecone over Qdrant/Weaviate?
- Fully managed — no infra to maintain
- Best-in-class namespace support (perfect for multi-tenancy)
- Serverless tier available (free to start)
- Excellent Node.js SDK
- Downside: $70/month at scale → switch to Qdrant self-hosted for enterprise

### Why Claude over GPT-4o?
- 200K context window (vs 128K GPT-4o)
- Better at following strict instructions (important for "only use context" rule)
- Better citation behavior in practice
- Competitive pricing at $3/$15 per million tokens
- Streaming API is clean and well-documented

### Why OpenAI for embeddings but Anthropic for LLM?
- OpenAI `text-embedding-3-small` has no good equivalent in Anthropic's lineup yet
- Mixing providers is fine — embeddings and LLM are independent steps
- Cost: $0.02/million tokens for embedding (essentially free)

### Why Cloudflare R2 over AWS S3?
- Zero egress fees (S3 charges $0.09/GB egress — adds up fast with PDF downloads)
- S3-compatible API — same SDK works
- Cheaper storage ($0.015/GB vs $0.023/GB)
- Free 10GB storage tier

---

## Common Gotchas

### PDF Parsing
- `pdf-parse` fails on password-protected PDFs → return helpful error
- Scanned PDFs (images only) produce empty text → detect and suggest OCR
- Some PDFs have garbled text extraction → check for < 10 chars/page
- Large PDFs (>100 pages) → chunk ingestion into background job later

### Pinecone
- Namespace must be a string — use `userId` (UUID works)
- Max 1000 vectors per upsert batch — implement batching
- Delete by metadata filter: `deleteMany({ filter: { docId: { $eq: docId } } })`
- Index must exist before first upsert — create in config/pinecone.ts on startup

### Streaming SSE
- Set these headers for SSE: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
- Fastify needs `reply.raw` for manual SSE writing
- Frontend: use `EventSource` API or `fetch` with `ReadableStream`
- Don't forget to call `reply.raw.end()` after stream completes

### JWT
- Access token: 15 minutes (short for security)
- Refresh token: 7 days (stored in httpOnly cookie)
- On 401 response: auto-refresh in Axios interceptor, retry original request
- Store access token in memory (Zustand), NOT localStorage (XSS risk)

### Chunking Edge Cases
- Empty chunks after splitting → filter out `chunk.trim().length > 50`
- Chunks with only whitespace/numbers → skip
- Very short documents (<3 chunks) → don't apply overlap
- Tables → detect with regex, keep as single chunk

### Rate Limiting
- Per-user limit: 100 requests per 15 minutes (Redis sliding window)
- Per-IP limit: 20 requests per minute (for unauth endpoints)
- NMI webhook must be EXCLUDED from rate limiting

---

## Performance Notes

### Embedding Batching
```typescript
// WRONG: 100 API calls for 100 chunks
for (const chunk of chunks) {
  await embedder.embed(chunk)  // slow!
}

// RIGHT: 1-2 API calls for 100 chunks
const batches = chunk(chunks, 100)  // OpenAI limit: 2048 inputs
for (const batch of batches) {
  await embedder.embedBatch(batch)
}
```

### Pinecone Query Optimization
```typescript
// Include only needed metadata fields
const results = await index.query({
  vector: queryVector,
  topK: 10,
  includeMetadata: true,
  includeValues: false,  // don't return raw vectors — saves bandwidth
})
```

### Redis Caching
- Cache embedding of repeated questions (same question asked many times)
- TTL: 1 hour
- Key: `embed:{sha256(question)}`
- Saves ~50ms and ~$0.001 per cache hit

---

## Security Notes

- NEVER log full API keys — log only first 8 chars
- NEVER store raw API keys in DB — store hash
- Validate file MIME type server-side (don't trust Content-Type header)
- Use `path.basename()` to sanitize filenames before S3 upload
- NMI webhook: ALWAYS verify signature before processing
- Admin routes: check role in middleware, not in route handlers

---

## Evals Tracking

| Date | Prompt Version | Dataset | Accuracy | Notes |
|------|---------------|---------|----------|-------|
| Day 21 | v1 | 20 Q | 72% | Baseline |
| Day 26 | v2 | 50 Q | 81% | Added citation rules |
| Day 30 | v3 | 50 Q | 87% | Added threshold tuning |

Target: >85% accuracy on golden dataset before launch.

---

## Cost Tracking (Monthly Estimates at 100 active users)

| Service | Usage | Cost |
|---------|-------|------|
| Anthropic Claude | 100 users × 500 Q × 3K tokens | ~$45 |
| OpenAI Embeddings | 100 users × 20 docs × 200 chunks | ~$0.10 |
| Pinecone | 2M vectors | ~$70 |
| Cloudflare R2 | 10GB storage | ~$0.15 |
| Railway (backend) | 1 service | ~$5 |
| Vercel (frontend) | Pro plan | ~$20 |
| PostgreSQL (Railway) | 1GB | ~$5 |
| Redis (Upstash) | 10K commands/day | ~$0 (free) |
| Resend (email) | 3K emails | ~$0 (free) |
| **Total** | | **~$145/mo** |

At $19/mo × 100 paid users = $1,900/mo revenue → healthy margins.

