# CONTEXT.md — System Logic & Business Rules

> This file explains HOW DocWise works internally. Read this before writing any code.

---

## 1. What DocWise Does (Plain English)

A user uploads a PDF → we break it into chunks → convert chunks to numbers (vectors) → store in a vector database. When the user asks a question → we convert the question to the same kind of numbers → find the most similar chunks → send those chunks + the question to Claude → get a grounded answer with citations.

**Key principle:** The LLM never makes things up. It ONLY answers based on the document chunks we retrieve.

---

## 2. RAG Pipeline — Step by Step

### Phase A: Ingestion (runs once when user uploads)

```
User uploads PDF
    ↓
Parse raw text (pdf-parse / mammoth)
    ↓
Clean text (remove headers/footers/noise)
    ↓
Chunk text (512 tokens, 64-token overlap, semantic boundaries)
    ↓
Embed each chunk (OpenAI text-embedding-3-small → 1536-dim vector)
    ↓
Store in Pinecone (namespace = userId, metadata = {text, page, docId, chunkIndex})
    ↓
Store document metadata in PostgreSQL (name, s3Key, chunkCount, status)
    ↓
Upload original file to Cloudflare R2
```

### Phase B: Query (runs every time user sends a message)

```
User sends question
    ↓
Embed question (same model: text-embedding-3-small)
    ↓
Query Pinecone (namespace = userId, topK=5, score_threshold=0.75)
    ↓
Rerank results (Cohere rerank OR score-based filtering)
    ↓
Build prompt (system prompt + retrieved chunks + conversation history + question)
    ↓
Stream response from Claude (claude-sonnet-4-6)
    ↓
Extract citations from response
    ↓
Save message + sources to PostgreSQL
    ↓
Stream tokens to frontend via SSE
```

---

## 3. Multi-Tenancy Model

Every user's data is isolated at THREE levels:

1. **Pinecone namespace** — `namespace: userId` — vectors are never shared
2. **PostgreSQL row-level** — every table has `userId` foreign key + all queries filter by it
3. **S3/R2 prefix** — files stored under `uploads/{userId}/{docId}/filename.pdf`

A user can NEVER access another user's documents — enforced in middleware, not just UI.

---

## 4. Chunking Strategy

We use **recursive character text splitting** with semantic awareness:

```
Chunk size: 512 tokens (~380 words)
Overlap: 64 tokens (~48 words)
Separators: ["\n\n", "\n", ". ", " ", ""]
```

**Why 512?** 
- Small enough to be semantically focused (one topic per chunk)
- Large enough to contain meaningful context
- Fits well within embedding model limits

**Why 64-token overlap?**
- Prevents losing context at chunk boundaries
- If an answer spans two chunks, overlap ensures continuity

**Special handling:**
- Tables → kept as single chunks (don't split mid-table)
- Headers → prepended to the following chunk for context
- Lists → kept together within a chunk

---

## 5. Embedding Model Choice

**Model:** `text-embedding-3-small` (OpenAI)
- Dimensions: 1536
- Cost: $0.02 per million tokens (~500 pages for $0.01)
- Speed: ~100ms per batch
- Quality: Excellent for English, good for multilingual

**Alternative:** `text-embedding-3-large` for higher accuracy at 3x cost.

---

## 6. Top-K and Threshold Settings

```
topK: 5          (retrieve 5 chunks per query)
threshold: 0.75  (minimum cosine similarity — reject irrelevant chunks)
```

**Why topK=5?**
- Enough context for multi-part answers
- Keeps prompt size manageable (5 × 512 tokens ≈ 2,560 tokens of context)
- Beyond 7-8 chunks, LLM quality degrades (too much noise)

**Why threshold=0.75?**
- Below 0.75, results are often tangentially related, not directly relevant
- Prevents hallucinations from weak matches
- If no chunks pass threshold → respond "I couldn't find relevant information in your documents"

**Dynamic adjustment:**
- If user has only 1 document: topK=5
- If user is querying across 5+ documents: topK=8
- If question contains "summarize" / "overview": topK=10, threshold=0.65

---

## 7. Reranking

After initial retrieval, we apply **Cohere Rerank** (or score-based filtering):

```
1. Retrieve topK=10 candidates from Pinecone
2. Send all 10 + the question to Cohere rerank API
3. Take top 5 by relevance score
4. Use these 5 as the final context
```

**Why rerank?** Vector similarity finds "semantically close" — not always "most relevant to this specific question." Reranking applies a cross-encoder that reads question AND chunk together for true relevance.

**Cost:** ~$1 per 1000 rerank calls (cheap relative to LLM cost)

---

## 8. System Prompt Architecture

The system prompt has 4 parts:
1. **Role definition** — who the AI is
2. **Behavior rules** — what it must and must not do
3. **Context injection** — the retrieved document chunks
4. **Output format** — how to structure the answer

See `PROMPT.md` for the full prompt templates.

---

## 9. Authentication Flow

```
Register:
  POST /auth/register → hash password → create user → send verify email → return JWT

Login:
  POST /auth/login → verify password → return {accessToken (15min), refreshToken (7d)}

Refresh:
  POST /auth/refresh → verify refreshToken → return new accessToken

Protected routes:
  All /api/* routes require Authorization: Bearer {accessToken}
  Middleware: verifyJWT → attach req.user → continue
```

Admin routes additionally check `req.user.role === 'admin'`.

---

## 10. Usage Limits & Enforcement

```javascript
// middleware/usageLimits.js
const PLAN_LIMITS = {
  free:    { docs: 3,         questions: 50,   fileSizeMB: 5  },
  starter: { docs: 20,        questions: 500,  fileSizeMB: 25 },
  pro:     { docs: Infinity,  questions: 5000, fileSizeMB: 100},
  enterprise: { docs: Infinity, questions: Infinity, fileSizeMB: 500 }
}

// Check on every /chat request:
const usage = await getMonthlyUsage(userId)  // from usage_logs table
if (usage.questions_used >= PLAN_LIMITS[user.plan].questions) {
  return 429 { error: "Monthly limit reached. Upgrade to continue." }
}
```

---

## 11. Error Handling Philosophy

| Error Type | Handling |
|---|---|
| PDF parsing fails | Return error, mark doc status='failed', notify user |
| Pinecone timeout | Retry 3x with exponential backoff |
| LLM API error | Return graceful "service temporarily unavailable" |
| No relevant chunks found | Return "I couldn't find relevant info" — never hallucinate |
| File too large | Reject at upload time with clear message |
| Rate limit hit | Return 429 with retry-after header |

---

## 12. Data Retention Policy

- Documents: kept until user deletes or account closes
- Chat history: kept indefinitely (user can delete sessions)
- Usage logs: kept 13 months for billing accuracy
- Original files (R2): deleted when user deletes document
- Vectors (Pinecone): deleted when user deletes document (`deleteMany` by docId metadata filter)
