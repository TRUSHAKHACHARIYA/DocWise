"use client";

import { FileText, MoreVertical, Trash2, Download, Eye, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'READY' | 'PROCESSING' | 'FAILED';
  uploadedAt: string;
}

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const isReady = document.status === 'READY';
  const isProcessing = document.status === 'PROCESSING';
  const isFailed = document.status === 'FAILED';

  return (
    <div className="group bg-white border border-slate-200 rounded-3xl p-5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0",
          isReady ? "bg-brand-500" : isProcessing ? "bg-amber-500 animate-pulse" : "bg-red-500"
        )}>
          <FileText size={24} />
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Eye size={18} />
          </button>
          <button 
            onClick={() => onDelete(document.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate mb-1">
          {document.name}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{document.type}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-xs font-bold text-slate-400">{document.size}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <Badge variant={
          isReady ? "success" : isProcessing ? "warning" : "danger"
        }>
          {document.status}
        </Badge>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{document.uploadedAt}</span>
      </div>

      {isReady && (
        <button className="w-full py-2.5 mt-1 bg-slate-50 text-slate-600 font-bold text-sm rounded-xl hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
          View Detail
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}

const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
