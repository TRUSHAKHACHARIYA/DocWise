export default function SdkPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-4">
        SDK Reference
      </h1>
      <p className="text-[var(--ink-muted)] mb-8">
        The TypeScript SDK provides type-safe access to the DocWise API.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold mb-3">Installation</h2>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`npm install @docwise/sdk`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Initialization</h2>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`import { DocWise } from '@docwise/sdk';

const client = new DocWise({
  apiKey: 'dw_your_key_here',
  // Optional: defaults to https://api.docwise.ai
  baseUrl: 'http://localhost:4000',
});`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Methods</h2>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-[rgba(26,24,20,0.10)]">
              <code className="text-sm font-mono font-semibold">client.retrieve(params)</code>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Search through indexed documents. Returns ranked chunks with scores and citations.
              </p>
              <div className="mt-3 rounded-lg bg-[var(--ink)] text-[var(--cream)] p-4">
                <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`const results = await client.retrieve({
  query: 'What are the termination clauses?',
  topK: 5,
  searchMode: 'hybrid',
  recencyBias: 0.3,
  filters: {
    uploadedAfter: '2026-01-01T00:00:00Z',
  },
});

for (const chunk of results.chunks) {
  console.log(chunk.documentName, chunk.score, chunk.text);
}`}
                </pre>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[rgba(26,24,20,0.10)]">
              <code className="text-sm font-mono font-semibold">client.uploadDocument(file, name)</code>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Upload a document for indexing. Accepts a Buffer or Blob.
              </p>
              <div className="mt-3 rounded-lg bg-[var(--ink)] text-[var(--cream)] p-4">
                <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`import { readFileSync } from 'fs';

const file = readFileSync('./contract.pdf');
const doc = await client.uploadDocument(file, 'contract.pdf');
console.log(doc.id, doc.status); // "PROCESSING"`}
                </pre>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[rgba(26,24,20,0.10)]">
              <code className="text-sm font-mono font-semibold">client.listDocuments()</code>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                List all documents for the authenticated user.
              </p>
              <div className="mt-3 rounded-lg bg-[var(--ink)] text-[var(--cream)] p-4">
                <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`const { documents } = await client.listDocuments();
for (const doc of documents) {
  console.log(doc.name, doc.status, doc.chunkCount);
}`}
                </pre>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-[rgba(26,24,20,0.10)]">
              <code className="text-sm font-mono font-semibold">client.deleteDocument(id)</code>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Delete a document and all its associated data.
              </p>
              <div className="mt-3 rounded-lg bg-[var(--ink)] text-[var(--cream)] p-4">
                <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`await client.deleteDocument('doc-id-here');`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Error Handling</h2>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`import { DocWise, DocWiseError } from '@docwise/sdk';

try {
  const results = await client.retrieve({ query: 'test' });
} catch (error) {
  if (error instanceof DocWiseError) {
    console.log(error.status);  // 401, 403, 400, etc.
    console.log(error.message); // Human-readable error
  }
}`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
