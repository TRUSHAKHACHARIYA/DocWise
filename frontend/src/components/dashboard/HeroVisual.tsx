"use client";

import { FileText, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-16 perspective-1000">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />

      {/* Main Dashboard Mockup */}
      <div className="relative bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up transform rotate-x-1 hover:rotate-x-0 transition-transform duration-700">
        {/* Mock Top Bar */}
        <div className="h-12 border-b border-slate-100 flex items-center px-6 gap-2 bg-slate-50/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          </div>
          <div className="w-32 h-4 bg-slate-100 rounded-full mx-auto" />
        </div>

        <div className="flex h-[400px]">
          {/* Left Panel: Document View */}
          <div className="w-2/3 p-8 border-r border-slate-100 relative">
             <div className="space-y-4">
                <div className="h-6 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-50 rounded" />
                  <div className="h-4 w-11/12 bg-slate-50 rounded" />
                  <div className="h-4 w-full bg-slate-50 rounded" />
                  {/* Highlighted Section */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-brand-400/20 rounded blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                    <div className="relative bg-brand-50 border-l-4 border-brand-500 p-2 text-sm font-medium text-brand-900 leading-relaxed">
                       "DocWise utilizes advanced RAG algorithms to ensure the context of every document is perfectly preserved during retrieval."
                    </div>
                  </div>
                  <div className="h-4 w-full bg-slate-50 rounded" />
                  <div className="h-4 w-10/12 bg-slate-50 rounded" />
                </div>
             </div>

             {/* Floating Citation Indicator */}
             <div className="absolute top-40 right-10 animate-bounce-subtle">
                <div className="bg-brand-600 text-white px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
                   <Sparkles size={14} />
                   <span className="text-[10px] font-black uppercase">Analysis Active</span>
                </div>
             </div>
          </div>

          {/* Right Panel: Chat Console */}
          <div className="w-1/3 bg-slate-50/30 p-6 flex flex-col gap-6">
             {/* User Q */}
             <div className="flex gap-3 items-start justify-end">
                <div className="bg-slate-900 text-white p-3 rounded-2xl rounded-tr-none text-[10px] font-bold shadow-sm">
                   How does DocWise handle large documents?
                </div>
             </div>

             {/* AI A */}
             <div className="flex gap-3 items-start animate-fade-in">
                <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-200">
                   <Sparkles size={12} className="text-white" />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm space-y-3">
                   <div className="space-y-1.5">
                      <div className="h-2 w-full bg-slate-100 rounded" />
                      <div className="h-2 w-full bg-slate-100 rounded" />
                      <div className="h-2 w-4/5 bg-slate-100 rounded" />
                   </div>
                   {/* Citation Badge */}
                   <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 w-fit rounded-lg text-[9px] font-black uppercase tracking-tighter">
                      <ShieldCheck size={10} />
                      Source Verified
                   </div>
                </div>
             </div>

             {/* Input Mock */}
             <div className="mt-auto h-10 w-full bg-white border border-slate-200 rounded-xl px-4 flex items-center justify-between shadow-inner">
                <div className="h-2 w-24 bg-slate-100 rounded" />
                <div className="w-6 h-6 bg-brand-500 rounded-lg shadow-lg shadow-brand-200" />
             </div>
          </div>
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-500/10 rounded-[2rem] rotate-12 -z-10 blur-xl animate-float" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-[3rem] -rotate-12 -z-10 blur-xl animate-float-delayed" />
    </div>
  );
}
