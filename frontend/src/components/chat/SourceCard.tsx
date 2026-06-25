"use client";

import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Source {
  title: string;
  excerpt: string;
  page?: number;
  documentId?: string;
}

interface SourceCardProps {
  source: Source;
  isActive?: boolean;
  onOpen?: (source: Source) => void;
}

export default function SourceCard({ source, isActive, onOpen }: SourceCardProps) {
  return (
    <div 
      onClick={() => onOpen?.(source)}
      className={cn(
        "group max-w-[240px] cursor-pointer rounded-xl border p-3 transition-all duration-300",
        isActive
          ? "border-brand-400 bg-brand-50 shadow-md"
          : "border-slate-100 bg-slate-50 hover:border-brand-200 hover:bg-white hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-brand-100 flex items-center justify-center text-brand-600">
          <FileText size={14} />
        </div>
        <p className="text-[11px] font-bold text-slate-700 truncate">{source.title}</p>
        <span className="ml-auto text-[10px] font-black text-brand-500 uppercase">
          {source.page ? `P. ${source.page}` : 'DOC'}
        </span>
      </div>
      
      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed italic mb-2">
        "{source.excerpt}"
      </p>
      
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 group-hover:text-brand-700 transition-colors">
        Read context
        <ExternalLink size={10} />
      </div>
    </div>
  );
}
