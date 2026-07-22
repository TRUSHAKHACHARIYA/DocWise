export default function GettingStartedPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-4">
        Getting Started
      </h1>
      <p className="text-[var(--ink-muted)] mb-8">
        Get up and running with the DocWise API in under 5 minutes.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold mb-3">1. Get an API Key</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--ink-muted)]">
            <li>Sign in to your DocWise account (Pro or Enterprise plan required).</li>
            <li>
              Navigate to{" "}
              <span className="font-mono text-xs bg-[rgba(26,24,20,0.06)] px-1.5 py-0.5 rounded">
                Settings &rarr; Developer
              </span>
            </li>
            <li>Click &quot;Create API Key&quot; and give it a name.</li>
            <li>
              Copy the key immediately — it starts with <code className="font-mono text-xs bg-[rgba(26,24,20,0.06)] px-1.5 py-0.5 rounded">dw_</code> and is shown only once.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">2. Make Your First Request</h2>
          <p className="text-sm text-[var(--ink-muted)] mb-3">
            Search through your indexed documents:
          </p>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`curl -X POST https://api.docwise.ai/api/v1/retrieve \\
  -H "Authorization: Bearer dw_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What is the payment schedule?",
    "topK": 3,
    "searchMode": "hybrid"
  }'`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">3. Upload a Document</h2>
          <p className="text-sm text-[var(--ink-muted)] mb-3">
            Upload a file for indexing. Supported formats: PDF, DOCX, DOC, TXT, JSON.
          </p>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`curl -X POST https://api.docwise.ai/api/v1/documents \\
  -H "Authorization: Bearer dw_your_key" \\
  -F "file=@contract.pdf"`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">4. Use the SDK (Optional)</h2>
          <p className="text-sm text-[var(--ink-muted)] mb-3">
            Install the TypeScript SDK for type-safe access:
          </p>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`npm install @docwise/sdk

import { DocWise } from '@docwise/sdk';

const client = new DocWise({ apiKey: 'dw_your_key' });

const results = await client.retrieve({
  query: 'What is the payment schedule?',
  topK: 3,
});

console.log(results.chunks);`}
            </pre>
          </div>
        </section>

        <div className="p-4 rounded-xl border border-brand-200 bg-brand-50 text-sm">
          <strong className="text-brand-700">Base URL:</strong>{" "}
          <code className="font-mono text-xs">https://api.docwise.ai/api/v1</code>
          <br />
          <span className="text-[var(--ink-muted)]">
            For local development, use{" "}
            <code className="font-mono text-xs">http://localhost:4000/api/v1</code>
          </span>
        </div>
      </div>
    </div>
  );
}
