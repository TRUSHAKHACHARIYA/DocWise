"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, FileText, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "@/store/toastStore";
import api from "@/lib/api";

interface DocInfo {
  id: string;
  name: string;
  status: string;
  chunkCount: number;
  pageCount: number;
  summary: string | null;
}

interface ChunkInfo {
  text: string;
  pageNumber: number | null;
  startIndex: number;
}

export default function ComparePage() {
  const [docs, setDocs] = useState<DocInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<{
    documents: DocInfo[];
    chunks: Record<string, ChunkInfo[]>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const response = await api.get("/v1/documents");
      setDocs(response.data.documents.filter((d: any) => d.status === "READY"));
    } catch (err) {
      toast.error("Error", "Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    if (selectedIds.length !== 2) return;
    setIsComparing(true);
    try {
      const response = await api.post("/v1/documents/compare", {
        documentIds: selectedIds,
      });
      setComparison(response.data);
    } catch (err) {
      toast.error("Error", "Failed to compare documents.");
    } finally {
      setIsComparing(false);
    }
  };

  const toggleDoc = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase">Compare Documents</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Select two documents to view their content side by side.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Document Selection */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
              Select 2 documents ({selectedIds.length}/2)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {docs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                    selectedIds.includes(doc.id)
                      ? "border-[var(--rust)] bg-[rgba(194,91,58,0.05)] shadow-sm"
                      : "border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500"
                  }`}
                >
                  <FileText size={20} className={selectedIds.includes(doc.id) ? "text-[var(--rust)]" : "text-slate-400 dark:text-slate-500"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{doc.chunkCount} chunks, {doc.pageCount} pages</p>
                  </div>
                  {selectedIds.includes(doc.id) && (
                    <span className="text-xs font-bold text-[var(--rust)] bg-[rgba(194,91,58,0.1)] px-2 py-1 rounded-lg">
                      #{selectedIds.indexOf(doc.id) + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleCompare}
                disabled={selectedIds.length !== 2}
                loading={isComparing}
                className="gap-2 bg-[var(--rust)] text-white hover:bg-[var(--rust-dark)] rounded-xl"
              >
                <ArrowLeftRight size={16} />
                Compare
              </Button>
            </div>
          </div>

          {/* Comparison Results */}
          {comparison && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {comparison.documents.map((doc, idx) => {
                const docId = doc.id;
                const chunks = comparison.chunks[docId] || [];
                return (
                  <div key={docId} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-700">
                      <h3 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{doc.name}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{doc.chunkCount} chunks, {doc.pageCount} pages</p>
                      {doc.summary && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">{doc.summary}</p>
                      )}
                    </div>
                    <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar space-y-3">
                      {chunks.map((chunk, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                            Page {chunk.pageNumber || '?'} • Chunk {i + 1}
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{chunk.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
