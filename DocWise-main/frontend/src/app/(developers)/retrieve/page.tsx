export default function RetrieveApiPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-4">
        Retrieve API
      </h1>
      <p className="text-[var(--ink-muted)] mb-8">
        Search through your indexed documents using semantic, keyword, or hybrid
        retrieval. Returns ranked chunks with citations.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold mb-3">POST /api/v1/retrieve</h2>

          <h3 className="font-semibold text-sm mb-2">Request Body</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[rgba(26,24,20,0.10)]">
                  <th className="text-left py-2 pr-4 font-semibold">Parameter</th>
                  <th className="text-left py-2 pr-4 font-semibold">Type</th>
                  <th className="text-left py-2 pr-4 font-semibold">Required</th>
                  <th className="text-left py-2 pr-4 font-semibold">Default</th>
                  <th className="text-left py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-[var(--ink-muted)]">
                <tr className="border-b border-[rgba(26,24,20,0.05)]">
                  <td className="py-2 pr-4 font-mono text-xs">query</td>
                  <td className="py-2 pr-4 font-mono text-xs">string</td>
                  <td className="py-2 pr-4">yes</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Search query (1-4000 chars)</td>
                </tr>
                <tr className="border-b border-[rgba(26,24,20,0.05)]">
                  <td className="py-2 pr-4 font-mono text-xs">documentIds</td>
                  <td className="py-2 pr-4 font-mono text-xs">string[]</td>
                  <td className="py-2 pr-4">no</td>
                  <td className="py-2 pr-4">all</td>
                  <td className="py-2">Scope to specific documents</td>
                </tr>
                <tr className="border-b border-[rgba(26,24,20,0.05)]">
                  <td className="py-2 pr-4 font-mono text-xs">topK</td>
                  <td className="py-2 pr-4 font-mono text-xs">number</td>
                  <td className="py-2 pr-4">no</td>
                  <td className="py-2 pr-4">5</td>
                  <td className="py-2">Number of results (1-20)</td>
                </tr>
                <tr className="border-b border-[rgba(26,24,20,0.05)]">
                  <td className="py-2 pr-4 font-mono text-xs">searchMode</td>
                  <td className="py-2 pr-4 font-mono text-xs">string</td>
                  <td className="py-2 pr-4">no</td>
                  <td className="py-2 pr-4">"hybrid"</td>
                  <td className="py-2">"semantic", "keyword", or "hybrid"</td>
                </tr>
                <tr className="border-b border-[rgba(26,24,20,0.05)]">
                  <td className="py-2 pr-4 font-mono text-xs">recencyBias</td>
                  <td className="py-2 pr-4 font-mono text-xs">number</td>
                  <td className="py-2 pr-4">no</td>
                  <td className="py-2 pr-4">0</td>
                  <td className="py-2">Weight for recency (0=off, 1=max)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">filters</td>
                  <td className="py-2 pr-4 font-mono text-xs">object</td>
                  <td className="py-2 pr-4">no</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Metadata filters (see below)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold text-sm mb-2">Filters</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[rgba(26,24,20,0.10)]">
                  <th className="text-left py-2 pr-4 font-semibold">Field</th>
                  <th className="text-left py-2 pr-4 font-semibold">Type</th>
                  <th className="text-left py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-[var(--ink-muted)]">
                <tr className="border-b border-[rgba(26,24,20,0.05)]">
                  <td className="py-2 pr-4 font-mono text-xs">documentId</td>
                  <td className="py-2 pr-4 font-mono text-xs">string[]</td>
                  <td className="py-2">Filter to specific document IDs</td>
                </tr>
                <tr className="border-b border-[rgba(26,24,20,0.05)]">
                  <td className="py-2 pr-4 font-mono text-xs">uploadedAfter</td>
                  <td className="py-2 pr-4 font-mono text-xs">ISO datetime</td>
                  <td className="py-2">Only chunks from documents created after this date</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">uploadedBefore</td>
                  <td className="py-2 pr-4 font-mono text-xs">ISO datetime</td>
                  <td className="py-2">Only chunks from documents created before this date</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Response</h2>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`{
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
}`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Search Modes</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-[rgba(26,24,20,0.10)]">
              <code className="text-sm font-mono font-semibold">hybrid</code>
              <span className="text-xs text-[var(--ink-faint)] ml-2">(default)</span>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Combines semantic (vector) search with keyword (full-text) search, merges
                results, deduplicates, then reranks with Cohere. Best overall quality.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[rgba(26,24,20,0.10)]">
              <code className="text-sm font-mono font-semibold">semantic</code>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Vector similarity search only via Pinecone. Best for conceptual/fuzzy queries.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[rgba(26,24,20,0.10)]">
              <code className="text-sm font-mono font-semibold">keyword</code>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                PostgreSQL full-text search only. Best for exact term matching (names, codes, dates).
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
