export default function DocumentsApiPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-4">
        Documents API
      </h1>
      <p className="text-[var(--ink-muted)] mb-8">
        Upload, list, and manage documents for indexing and retrieval.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold mb-3">POST /api/v1/documents</h2>
          <p className="text-sm text-[var(--ink-muted)] mb-3">
            Upload a document for indexing. Accepts multipart form data.
          </p>
          <h3 className="font-semibold text-sm mb-2">Supported Formats</h3>
          <ul className="list-disc list-inside text-sm text-[var(--ink-muted)] mb-3 space-y-1">
            <li>PDF (.pdf)</li>
            <li>Word (.docx, .doc)</li>
            <li>Plain text (.txt)</li>
            <li>JSON (.json)</li>
          </ul>
          <p className="text-xs text-[var(--ink-faint)] mb-3">Maximum file size: 10MB</p>

          <h3 className="font-semibold text-sm mb-2">Request</h3>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5 mb-4">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`curl -X POST https://api.docwise.ai/api/v1/documents \\
  -H "Authorization: Bearer dw_your_key" \\
  -F "file=@contract.pdf"`}
            </pre>
          </div>

          <h3 className="font-semibold text-sm mb-2">Response</h3>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`{
  "document": {
    "id": "doc-id",
    "name": "contract.pdf",
    "status": "PROCESSING",
    "sizeBytes": 1048576,
    "mimeType": "application/pdf",
    "createdAt": "2026-07-22T10:00:00Z"
  }
}`}
            </pre>
          </div>
          <p className="text-xs text-[var(--ink-faint)] mt-2">
            Documents are processed asynchronously. The status field transitions from
            PROCESSING to READY (or FAILED) as the ingestion pipeline completes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">GET /api/v1/documents</h2>
          <p className="text-sm text-[var(--ink-muted)] mb-3">
            List all documents for the authenticated user.
          </p>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`{
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
}`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">DELETE /api/v1/documents/:id</h2>
          <p className="text-sm text-[var(--ink-muted)] mb-3">
            Delete a document and all associated data (vectors, chunks, stored file).
          </p>
          <div className="rounded-xl bg-[var(--ink)] text-[var(--cream)] p-5">
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed opacity-80">
{`{
  "message": "Document deleted successfully"
}`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
