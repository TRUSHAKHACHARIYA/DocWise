"use client";

import { X, Search } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { searchPlugin } from "@react-pdf-viewer/search";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  documentId: string;
  documentName: string;
  initialPage?: number;
  initialSearch?: string;
  variant?: "overlay" | "embedded";
  onClose?: () => void;
}

function buildSearchKeywords(excerpt?: string): string[] {
  if (!excerpt) {
    return [];
  }

  const cleaned = excerpt
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return [];
  }

  const words = cleaned.split(" ").filter(Boolean);
  if (words.length <= 12) {
    return [cleaned];
  }

  return [words.slice(0, 12).join(" ")];
}

export default function PDFViewer({
  documentId,
  documentName,
  initialPage,
  initialSearch,
  variant = "overlay",
  onClose,
}: PDFViewerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documentLoaded, setDocumentLoaded] = useState(false);

  const searchPluginInstance = useMemo(
    () =>
      searchPlugin({
        onHighlightKeyword: (props) => {
          props.highlightEle.style.backgroundColor = "rgba(194, 91, 58, 0.35)";
          props.highlightEle.style.outline = "2px solid rgba(194, 91, 58, 0.85)";
          props.highlightEle.style.borderRadius = "2px";
        },
      }),
    []
  );

  const { highlight, jumpToNextMatch } = searchPluginInstance;
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await api.get(`/documents/${documentId}/view`);
        setUrl(response.data.url);
      } catch (err) {
        console.error("Failed to load PDF URL", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUrl();
  }, [documentId]);

  const handleDocumentLoad = useCallback(() => {
    setDocumentLoaded(true);
  }, []);

  useEffect(() => {
    if (!documentLoaded || !initialSearch) {
      return;
    }

    const keywords = buildSearchKeywords(initialSearch);
    if (keywords.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      highlight(keywords);
      jumpToNextMatch();
    }, 400);

    return () => clearTimeout(timer);
  }, [documentLoaded, initialSearch, highlight, jumpToNextMatch]);

  const workerUrl = `https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`;
  const isEmbedded = variant === "embedded";
  const searchPreview = initialSearch
    ? buildSearchKeywords(initialSearch)[0]
    : null;

  const viewerContent = (
    <>
      <div
        className={cn(
          "flex items-center justify-between border-b border-slate-100 bg-slate-50/50",
          isEmbedded ? "px-4 py-3" : "px-8 py-5"
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-200">
            <Search size={16} />
          </div>
          <div className="min-w-0">
            <h3 className={cn("truncate font-black leading-none text-slate-900", isEmbedded ? "text-sm" : "text-lg")}>
              {documentName}
            </h3>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {initialSearch ? "Citation highlight" : "Document viewer"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {initialPage && (
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 md:flex">
              Page {initialPage}
            </div>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-100">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Preparing document
            </p>
          </div>
        ) : url ? (
          <div className="h-full w-full">
            <Worker workerUrl={workerUrl}>
              <Viewer
                fileUrl={url}
                plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
                initialPage={initialPage ? initialPage - 1 : 0}
                onDocumentLoad={handleDocumentLoad}
              />
            </Worker>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-bold text-red-500">Failed to load PDF</p>
          </div>
        )}
      </div>

      {searchPreview && !isEmbedded && (
        <div className="flex items-center gap-4 border-t border-brand-100 bg-brand-50 px-8 py-4">
          <div className="rounded-lg bg-brand-500 p-1.5 text-white">
            <Search size={14} />
          </div>
          <p className="text-sm font-bold text-brand-900">
            Highlighting:{" "}
            <span className="italic text-brand-700">
              &quot;{searchPreview.substring(0, 80)}
              {searchPreview.length > 80 ? "..." : ""}&quot;
            </span>
          </p>
        </div>
      )}
    </>
  );

  if (isEmbedded) {
    return <div className="flex h-full flex-col overflow-hidden">{viewerContent}</div>;
  }

  return (
    <div className="fixed inset-0 z-[60] flex animate-in items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm duration-300 md:p-8">
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        {viewerContent}
      </div>
    </div>
  );
}
