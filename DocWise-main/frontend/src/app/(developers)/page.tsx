import Link from "next/link";
import { ArrowRight, Search, FolderOpen, Key } from "lucide-react";

export default function DevelopersPage() {
  return (
    <div>
      <h1 className="font-display text-4xl font-bold tracking-tight mb-4">
        DocWise API
      </h1>
      <p className="text-lg text-[var(--ink-muted)] mb-8">
        Build AI-powered document retrieval into your applications. Search
        through indexed documents, upload new ones, and get cited answers — all
        via a clean REST API.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        <Link
          href="/developers/getting-started"
          className="group flex items-start gap-4 p-5 rounded-xl border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
            <Key size={18} className="text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-brand-600 transition-colors">
              Getting Started
            </h3>
            <p className="text-xs text-[var(--ink-muted)]">
              Get your API key and make your first request in under 5 minutes.
            </p>
          </div>
        </Link>

        <Link
          href="/developers/retrieve"
          className="group flex items-start gap-4 p-5 rounded-xl border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
            <Search size={18} className="text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-brand-600 transition-colors">
              Retrieve API
            </h3>
            <p className="text-xs text-[var(--ink-muted)]">
              Search documents with semantic, keyword, or hybrid retrieval.
            </p>
          </div>
        </Link>

        <Link
          href="/developers/api-docs"
          className="group flex items-start gap-4 p-5 rounded-xl border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
            <FolderOpen size={18} className="text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-brand-600 transition-colors">
              Documents API
            </h3>
            <p className="text-xs text-[var(--ink-muted)]">
              Upload, list, and manage documents for indexing.
            </p>
          </div>
        </Link>

        <Link
          href="/developers/sdk"
          className="group flex items-start gap-4 p-5 rounded-xl border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
            <ArrowRight size={18} className="text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-brand-600 transition-colors">
              SDK Reference
            </h3>
            <p className="text-xs text-[var(--ink-muted)]">
              Use the TypeScript SDK for type-safe API access.
            </p>
          </div>
        </Link>
      </div>

      <div className="p-5 rounded-xl bg-[var(--ink)] text-[var(--cream)]">
        <h3 className="font-semibold text-sm mb-2">Quick Example</h3>
        <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`curl -X POST https://api.docwise.ai/api/v1/retrieve \\
  -H "Authorization: Bearer dw_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What are the termination clauses?"}'`}
        </pre>
      </div>
    </div>
  );
}
