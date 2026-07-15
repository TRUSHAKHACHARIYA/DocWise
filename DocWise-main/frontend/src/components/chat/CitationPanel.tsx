"use client";

import { FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import PDFViewer from "./PDFViewer";
import { Source } from "./SourceCard";

interface CitationPanelProps {
  sources: Source[];
  activeSource: Source | null;
  onSourceSelect: (source: Source) => void;
  onClear: () => void;
  onClose?: () => void;
  className?: string;
}

export default function CitationPanel({
  sources,
  activeSource,
  onSourceSelect,
  onClear,
  onClose,
  className,
}: CitationPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-[rgba(26,24,20,0.08)] px-5 py-4">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">Sources &amp; evidence</h4>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
            {sources.length} citation{sources.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {activeSource && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--ink-faint)] transition-colors hover:bg-[var(--cream)] hover:text-[var(--ink-muted)]"
            >
              Clear
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close citation panel"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-faint)] transition-colors hover:bg-[var(--cream)] hover:text-[var(--ink)]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="custom-scrollbar flex-shrink-0 max-h-[38%] overflow-y-auto border-b border-[rgba(26,24,20,0.08)] p-3">
        {sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <FileText className="mb-3 h-8 w-8 text-[var(--ink-faint)]" />
            <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-[var(--ink-faint)]">
              Click a citation in the chat to preview the source here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sources.map((source, index) => {
              const isActive =
                activeSource?.documentId === source.documentId &&
                activeSource?.page === source.page &&
                activeSource?.excerpt === source.excerpt;

              return (
                <button
                  key={`${source.documentId}-${source.page}-${index}`}
                  type="button"
                  onClick={() => onSourceSelect(source)}
                  className={cn(
                    "w-full rounded-2xl border p-3 text-left transition-all",
                    isActive
                      ? "border-[var(--rust)] bg-[var(--rust-light)] shadow-sm"
                      : "border-[rgba(26,24,20,0.08)] bg-[var(--cream)] hover:border-[rgba(194,91,58,0.25)] hover:bg-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={14} className={isActive ? "text-[var(--rust-dark)]" : "text-[var(--ink-faint)]"} />
                    <p className="min-w-0 flex-1 truncate text-xs font-bold text-[var(--ink)]">{source.title}</p>
                    {source.page && (
                      <span className="text-[10px] font-black uppercase text-brand-600">p. {source.page}</span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-[10px] italic leading-relaxed text-[var(--ink-muted)]">
                    &ldquo;{source.excerpt}&rdquo;
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 bg-[rgba(250,248,244,0.5)]">
        {activeSource?.documentId ? (
          <PDFViewer
            variant="embedded"
            documentId={activeSource.documentId}
            documentName={activeSource.title}
            initialPage={activeSource.page}
            initialSearch={activeSource.excerpt}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">
              Source preview
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--ink-muted)]">
              Select a citation above to jump to the highlighted passage in the document.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
