# DocWise API Reference

Base URL: `https://your-docwise-instance.com/api/v1`

All endpoints require authentication via a Bearer token (API key or JWT).

---

## Authentication

```
Authorization: Bearer dw_your_api_key_here
```

API keys are generated from the Settings > Developer page in the DocWise dashboard. Only Pro and Enterprise plans have API key access. Keys are shown once at creation time — store them securely.

---

## POST /api/v1/retrieve

Search through your indexed documents using semantic, keyword, or hybrid retrieval.

### Request

```json
{
  "query": "What are the termination clauses?",
  "documentIds": ["doc-id-1", "doc-id-2"],
  "topK": 5,
  "searchMode": "hybrid",
  "recencyBias": 0.3,
  "filters": {
    "uploadedAfter": "2026-01-01T00:00:00Z"
  }
}
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | yes | — | Search query (1-4000 chars) |
| `documentIds` | string[] | no | all | Scope results to specific documents |
| `topK` | number | no | 5 | Number of results (1-20) |
| `searchMode` | string | no | `"hybrid"` | `"semantic"`, `"keyword"`, or `"hybrid"` |
| `recencyBias` | number | no | 0 | Weight for recency (0=off, 1=max) |
| `filters` | object | no | — | Metadata filters (see below) |

#### Filters

| Field | Type | Description |
|-------|------|-------------|
| `documentId` | string[] | Filter to specific document IDs |
| `uploadedAfter` | ISO datetime | Only chunks from documents created after this date |
| `uploadedBefore` | ISO datetime | Only chunks from documents created before this date |

### Response

```json
{
  "chunks": [
    {
      "text": "The agreement may be terminated by either party...",
      "score": 0.92,
      "documentId": "doc-id-1",
      "documentName": "Service Agreement.pdf",
      "page": 3
    }
  ],
  "query": "What are the termination clauses?",
  "retrievedCount": 1,
  "searchMode": "hybrid"
}
```

### Search Modes

- **`hybrid`** (default) — Combines semantic (vector) search with keyword (full-text) search, merges results, deduplicates, then reranks with Cohere. Best overall quality.
- **`semantic`** — Vector similarity search only via Pinecone. Best for conceptual/fuzzy queries.
- **`keyword`** — PostgreSQL full-text search only. Best for exact term matching (names, codes, dates).

### Recency Bias

When `recencyBias > 0`, more recently ingested documents receive a score boost. The boost is linear over a 90-day window: a document created today gets full freshness, one created 90+ days ago gets none. The bias is applied after Cohere reranking, so it adjusts scores without changing the retrieval pipeline.

### Errors

| Code | Description |
|------|-------------|
| 401 | Invalid or missing API key |
| 403 | Query limit reached for your plan |
| 400 | Validation error (invalid parameters) |

---

## POST /api/v1/documents

Upload a document for indexing. Accepts multipart form data.

### Request

```
Content-Type: multipart/form-data

file: <binary file data>
```

Supported file types: PDF, DOCX, DOC, TXT, JSON. Maximum file size: 10MB.

### Response

```json
{
  "document": {
    "id": "doc-id",
    "name": "contract.pdf",
    "status": "PROCESSING",
    "sizeBytes": 1048576,
    "mimeType": "application/pdf",
    "createdAt": "2026-07-22T10:00:00Z"
  }
}
```

Documents are processed asynchronously. The `status` field transitions from `PROCESSING` to `READY` (or `FAILED`) as the ingestion pipeline completes.

---

## GET /api/v1/documents

List all documents for the authenticated user.

### Response

```json
{
  "documents": [
    {
      "id": "doc-id",
      "name": "contract.pdf",
      "status": "READY",
      "chunkCount": 42,
      "pageCount": 5,
      "sizeBytes": 1048576,
      "createdAt": "2026-07-22T10:00:00Z"
    }
  ]
}
```

---

## DELETE /api/v1/documents/:id

Delete a document and all its associated data (vectors, chunks, stored file).

### Response

```json
{
  "message": "Document deleted successfully"
}
```

---

## Rate Limits

All endpoints share a rate limit of 100 requests per 15-minute window per API key. Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1690000000
```

---

## Code Examples

### cURL

```bash
# Retrieve
curl -X POST https://your-docwise-instance.com/api/v1/retrieve \
  -H "Authorization: Bearer dw_your_key" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the payment schedule?", "topK": 3}'

# Upload document
curl -X POST https://your-docwise-instance.com/api/v1/documents \
  -H "Authorization: Bearer dw_your_key" \
  -F "file=@contract.pdf"

# List documents
curl https://your-docwise-instance.com/api/v1/documents \
  -H "Authorization: Bearer dw_your_key"
```

### JavaScript (TypeScript SDK)

```typescript
import { DocWise } from '@docwise/sdk';

const client = new DocWise({ apiKey: 'dw_your_key' });

const results = await client.retrieve({
  query: 'What is the payment schedule?',
  topK: 3,
  searchMode: 'hybrid',
});

for (const chunk of results.chunks) {
  console.log(`${chunk.documentName} (p${chunk.page}): ${chunk.text}`);
}
```

### Python

```python
import requests

response = requests.post(
    'https://your-docwise-instance.com/api/v1/retrieve',
    headers={'Authorization': 'Bearer dw_your_key'},
    json={'query': 'What is the payment schedule?', 'topK': 3},
)

for chunk in response.json()['chunks']:
    print(f"{chunk['documentName']} (p{chunk.get('page', '?')}): {chunk['text']}")
```
