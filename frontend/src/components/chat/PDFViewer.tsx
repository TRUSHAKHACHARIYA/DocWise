"use client";

import { X, ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

interface PDFViewerProps {
  documentId: string;
  documentName: string;
  initialPage?: number;
  initialSearch?: string;
  onClose: () => void;
}

export default function PDFViewer({ 
  documentId, 
  documentName, 
  initialPage, 
  initialSearch, 
  onClose 
}: PDFViewerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await api.get(`/api/documents/${documentId}/view`);
        setUrl(response.data.url);
      } catch (err) {
        console.error("Failed to load PDF URL", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUrl();
  }, [documentId]);

  // pdfjs worker URL - using a stable version
  const workerUrl = `https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white w-full h-full max-w-6xl rounded-[2.5rem] shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-200">
              <Search size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-none">{documentName}</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Contextual Highlighting Active
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {initialPage && (
                <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-600 gap-2">
                  Jumping to Page {initialPage}
                </div>
             )}
             <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center"
             >
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 relative bg-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Preparing Document</p>
            </div>
          ) : url ? (
            <div className="h-full w-full">
               <Worker workerUrl={workerUrl}>
                  <Viewer 
                    fileUrl={url} 
                    plugins={[defaultLayoutPluginInstance]}
                    initialPage={initialPage ? initialPage - 1 : 0}
                  />
               </Worker>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-red-500 font-bold">Failed to load PDF</p>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        {initialSearch && (
          <div className="px-8 py-4 bg-brand-50 border-t border-brand-100 flex items-center gap-4">
            <div className="bg-brand-500 text-white p-1.5 rounded-lg">
              <Search size={14} />
            </div>
            <p className="text-sm font-bold text-brand-900">
              Searching for: <span className="italic text-brand-700">"{initialSearch.substring(0, 50)}..."</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
