"use client";

import { useState, useEffect } from "react";
import { GitCompare, FileText, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/hooks/useDocuments";
import api from "@/lib/api";
import { toast } from "@/store/toastStore";

interface CompareDifference {
  topic: string;
  analysis: string;
  docAExcerpt: string;
  docBExcerpt: string;
  docAName: string;
  docBName: string;
}

interface CompareResult {
  summary: string;
  differences: CompareDifference[];
}

export default function ComparePage() {
  const { documents, loadDocuments } = useDocuments();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focus, setFocus] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const readyDocs = documents.filter((d) => d.status === "READY");

  const toggleDoc = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const runCompare = async () => {
    if (selectedIds.length < 2) {
      toast.error("Select documents", "Choose exactly two ready documents.");
      return;
    }

    setIsComparing(true);
    try {
      const response = await api.post("/chat/compare", {
        documentIds: selectedIds.slice(0, 2),
        focus: focus || undefined,
      });
      setResult(response.data);
    } catch (error: any) {
      toast.error("Compare failed", error.response?.data?.error || "Could not compare documents.");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">Document comparison</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-muted)]">
          Select two documents to generate a cited comparison summary and difference table.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--ink)]">
            <FileText size={16} /> Select 2 documents
          </h2>
          <div className="space-y-2">
            {readyDocs.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => toggleDoc(doc.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  selectedIds.includes(doc.id)
                    ? "border-[var(--rust)] bg-[var(--rust-light)]"
                    : "border-[rgba(26,24,20,0.08)] hover:bg-[var(--cream)]"
                )}
              >
                <span className="truncate font-semibold">{doc.name}</span>
                {selectedIds.includes(doc.id) && (
                  <span className="text-[10px] font-black uppercase text-brand-600">Selected</span>
                )}
              </button>
            ))}
            {readyDocs.length < 2 && (
              <p className="py-8 text-center text-xs font-bold uppercase tracking-widest text-[var(--ink-faint)]">
                Upload at least two ready documents
              </p>
            )}
          </div>

          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Optional focus (e.g. termination clauses)"
            className="mt-6 w-full rounded-xl border border-[rgba(26,24,20,0.10)] bg-[var(--cream)] px-4 py-3 text-sm outline-none focus:border-brand-400"
          />

          <Button onClick={runCompare} disabled={isComparing} className="mt-4 gap-2">
            {isComparing ? <Loader2 size={16} className="animate-spin" /> : <GitCompare size={16} />}
            Compare documents
          </Button>
        </div>

        <div>
          {result ? (
            <div className="rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">Comparison summary</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--ink-muted)]">{result.summary}</p>
              <div className="mt-6 space-y-4">
                {result.differences.map((diff) => (
                  <div key={diff.topic} className="rounded-2xl border border-[rgba(26,24,20,0.08)] bg-[var(--cream)] p-4">
                    <h3 className="font-bold text-[var(--ink)]">{diff.topic}</h3>
                    <p className="mt-2 text-sm text-[var(--ink-muted)]">{diff.analysis}</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="rounded-xl bg-white p-3 text-xs">
                        <p className="font-black uppercase text-brand-600">{diff.docAName}</p>
                        <p className="mt-1 italic text-[var(--ink-muted)]">&ldquo;{diff.docAExcerpt}&rdquo;</p>
                      </div>
                      <div className="rounded-xl bg-white p-3 text-xs">
                        <p className="font-black uppercase text-brand-600">{diff.docBName}</p>
                        <p className="mt-1 italic text-[var(--ink-muted)]">&ldquo;{diff.docBExcerpt}&rdquo;</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-[rgba(26,24,20,0.12)] bg-[var(--cream)] p-10 text-center">
              <GitCompare className="mb-4 h-10 w-10 text-[var(--ink-faint)]" />
              <p className="text-sm font-bold text-[var(--ink-muted)]">Results will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
