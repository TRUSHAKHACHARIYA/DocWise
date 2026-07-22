export default function AuthenticationPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-4">
        Authentication
      </h1>
      <p className="text-[var(--ink-muted)] mb-8">
        All API requests require a Bearer token in the Authorization header.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold mb-3">API Keys</h2>
          <p className="text-sm text-[var(--ink-muted)] mb-3">
            DocWise API keys start with <code className="font-mono text-xs bg-[rgba(26,24,20,0.06)] px-1.5 py-0.5 rounded">dw_</code> and
            are created from the{" "}
            <span className="font-mono text-xs bg-[rgba(26,24,20,0.06)] px-1.5 py-0.5 rounded">
              Settings &rarr; Developer
            </span>{" "}
            page. Only Pro and Enterprise plans can create API keys.
          </p>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`Authorization: Bearer dw_your_api_key_here`}
            </pre>
          </div>
          <p className="text-xs text-[var(--ink-faint)] mt-2">
            Keys are shown once at creation time. Store them securely. Revoke compromised
            keys immediately from the Developer settings page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Request Example</h2>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`curl -X POST https://api.docwise.ai/api/v1/retrieve \\
  -H "Authorization: Bearer dw_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Hello world"}'`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Error Responses</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-[rgba(26,24,20,0.10)]">
              <code className="text-sm font-mono font-semibold">401 Unauthorized</code>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Missing, invalid, or revoked API key.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[rgba(26,24,20,0.10)]">
              <code className="text-sm font-mono font-semibold">403 Forbidden</code>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Valid key but insufficient plan (API keys require Pro or Enterprise) or
                usage limit reached.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Rate Limits</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            All endpoints share a rate limit of <strong>100 requests per 15-minute
            window</strong> per API key. Rate limit status is returned in response headers.
          </p>
        </section>
      </div>
    </div>
  );
}
