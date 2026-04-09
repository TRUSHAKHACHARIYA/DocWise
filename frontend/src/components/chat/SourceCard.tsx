"use client";

import { FileText, ExternalLink } from "lucide-react";

interface Source {
  title: string;
  excerpt: string;
  page?: number;
}

export default function SourceCard({ source }: { source: Source }) {
  return (
    <div className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-brand-200 hover:shadow-md rounded-xl p-3 max-w-[240px] transition-all duration-300">
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
      
      <button className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 hover:text-brand-700 transition-colors">
        Read context
        <ExternalLink size={10} />
      </button>
    </div>
  );
}
