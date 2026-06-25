"use client";

import { Sparkles, ShieldCheck } from "lucide-react";

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-16 perspective-1000">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-brand-500/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[rgba(74,103,65,0.10)] rounded-full blur-[100px] -z-10 animate-pulse-soft" />
      <div className="absolute -top-2 right-12 z-10 hidden rounded-[1.5rem] border border-[rgba(26,24,20,0.08)] bg-[rgba(255,253,249,0.9)] px-4 py-3 shadow-[0_24px_40px_-30px_rgba(26,24,20,0.25)] backdrop-blur-sm md:block animate-float">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--rust-dark)]">Live Retrieval</div>
        <div className="mt-1 text-sm font-semibold text-[var(--ink-muted)]">3 cited answers in 2.4s</div>
      </div>
      <div className="absolute -bottom-2 left-6 z-10 hidden rounded-[1.5rem] border border-[rgba(26,24,20,0.08)] bg-[rgba(255,253,249,0.92)] px-4 py-3 shadow-[0_24px_40px_-30px_rgba(26,24,20,0.25)] backdrop-blur-sm md:block animate-float-delayed">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--sage)]">Source Confidence</div>
        <div className="mt-1 text-sm font-semibold text-[var(--ink-muted)]">Every answer points back to the page</div>
      </div>

      <div className="relative bg-[rgba(255,253,249,0.82)] backdrop-blur-xl border border-[rgba(26,24,20,0.10)] rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up transform rotate-x-1 hover:rotate-x-0 transition-transform duration-700">
        <div className="h-12 border-b border-[rgba(26,24,20,0.08)] flex items-center px-6 gap-2 bg-[rgba(250,248,244,0.72)]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[rgba(26,24,20,0.14)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[rgba(26,24,20,0.14)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[rgba(26,24,20,0.14)]" />
          </div>
          <div className="w-36 h-4 bg-[rgba(26,24,20,0.06)] rounded-full mx-auto" />
        </div>

        <div className="grid md:grid-cols-[0.55fr_1fr_0.85fr] min-h-[420px]">
          <div className="hidden border-r border-[rgba(26,24,20,0.08)] bg-[rgba(250,248,244,0.55)] p-4 md:block">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--ink-faint)]">Workspace</div>
            <div className="mt-4 space-y-2">
              {["MSA_2024.pdf", "Security_Policy.docx", "Q3_Report.pdf"].map((doc, index) => (
                <div
                  key={doc}
                  className={`rounded-xl px-3 py-2 text-[10px] font-semibold ${index === 0 ? "bg-brand-50 text-brand-800 border border-brand-200" : "text-[var(--ink-muted)]"}`}
                >
                  {doc}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 border-r border-[rgba(26,24,20,0.08)] relative">
            <div className="space-y-4">
              <div className="h-6 w-3/4 bg-[rgba(26,24,20,0.08)] rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-[rgba(26,24,20,0.05)] rounded" />
                <div className="h-4 w-11/12 bg-[rgba(26,24,20,0.05)] rounded" />
                <div className="h-4 w-full bg-[rgba(26,24,20,0.05)] rounded" />
                <div className="relative">
                  <div className="absolute -inset-1 bg-brand-400/20 rounded blur opacity-75" />
                  <div className="relative bg-brand-50 border-l-4 border-brand-500 p-3 text-sm font-medium text-brand-900 leading-relaxed rounded-r-xl">
                    "DocWise keeps context intact so every answer stays grounded in the source text."
                  </div>
                </div>
                <div className="h-4 w-full bg-[rgba(26,24,20,0.05)] rounded" />
                <div className="h-4 w-10/12 bg-[rgba(26,24,20,0.05)] rounded" />
              </div>
            </div>

            <div className="absolute top-40 right-10">
              <div className="flex items-center gap-2 rounded-xl bg-[var(--rust)] px-3 py-1.5 text-white shadow-xl shadow-[rgba(194,91,58,0.18)]">
                <Sparkles size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Analysis active</span>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(245,239,231,0.65)] p-6 flex flex-col gap-5">
            <div className="flex gap-3 items-start justify-end">
              <div className="max-w-[220px] rounded-2xl rounded-tr-none border border-[rgba(194,91,58,0.16)] bg-[linear-gradient(180deg,#fff7ef_0%,#f7e7d8_100%)] p-3 text-[10px] font-bold text-[var(--ink)] shadow-sm">
                What termination notice applies under Section 12?
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand-200">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="bg-white border border-[rgba(26,24,20,0.08)] p-4 rounded-2xl rounded-tl-none shadow-sm space-y-3">
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-[rgba(26,24,20,0.06)] rounded" />
                  <div className="h-2 w-full bg-[rgba(26,24,20,0.06)] rounded" />
                  <div className="h-2 w-4/5 bg-[rgba(26,24,20,0.06)] rounded" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--sage-light)] text-[var(--sage)] w-fit rounded-lg text-[9px] font-black uppercase tracking-tighter">
                  <ShieldCheck size={10} />
                  Source verified
                </div>
              </div>
            </div>

            <div className="mt-auto h-10 w-full bg-white border border-[rgba(26,24,20,0.08)] rounded-xl px-4 flex items-center justify-between shadow-inner">
              <div className="h-2 w-28 bg-[rgba(26,24,20,0.06)] rounded" />
              <div className="w-6 h-6 bg-brand-600 rounded-lg shadow-lg shadow-brand-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-500/10 rounded-[2rem] rotate-12 -z-10 blur-xl animate-float" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[rgba(74,103,65,0.10)] rounded-[3rem] -rotate-12 -z-10 blur-xl animate-float-delayed" />
    </div>
  );
}
