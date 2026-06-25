"use client";

import { GitCompare, PanelRight, Sparkles, ShieldCheck } from "lucide-react";

export default function HeroVisual() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-5xl perspective-1000">
      <div className="absolute top-1/2 left-1/2 -z-10 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-[120px]" />
      <div className="absolute top-1/4 right-1/4 -z-10 h-[300px] w-[300px] animate-pulse-soft rounded-full bg-[rgba(74,103,65,0.10)] blur-[100px]" />

      <div className="absolute -top-2 right-8 z-10 hidden animate-float rounded-[1.5rem] border border-[rgba(26,24,20,0.08)] bg-[rgba(255,253,249,0.9)] px-4 py-3 shadow-[0_24px_40px_-30px_rgba(26,24,20,0.25)] backdrop-blur-sm md:block">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--rust-dark)]">Citation panel</div>
        <div className="mt-1 text-sm font-semibold text-[var(--ink-muted)]">Jump to the exact page &amp; passage</div>
      </div>

      <div className="absolute -bottom-2 left-4 z-10 hidden animate-float-delayed rounded-[1.5rem] border border-[rgba(26,24,20,0.08)] bg-[rgba(255,253,249,0.92)] px-4 py-3 shadow-[0_24px_40px_-30px_rgba(26,24,20,0.25)] backdrop-blur-sm md:block">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--sage)]">
          <GitCompare size={12} />
          Document compare
        </div>
        <div className="mt-1 text-sm font-semibold text-[var(--ink-muted)]">Cited differences across two files</div>
      </div>

      <div className="animate-slide-up relative rotate-x-1 transform overflow-hidden rounded-[2.5rem] border border-[rgba(26,24,20,0.10)] bg-[rgba(255,253,249,0.82)] shadow-2xl backdrop-blur-xl transition-transform duration-700 hover:rotate-x-0">
        <div className="flex h-12 items-center gap-2 border-b border-[rgba(26,24,20,0.08)] bg-[rgba(250,248,244,0.72)] px-6">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[rgba(26,24,20,0.14)]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[rgba(26,24,20,0.14)]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[rgba(26,24,20,0.14)]" />
          </div>
          <div className="mx-auto h-4 w-40 rounded-full bg-[rgba(26,24,20,0.06)]" />
          <div className="hidden items-center gap-1 rounded-lg bg-[var(--rust-light)] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--rust-dark)] sm:flex">
            <PanelRight size={10} />
            3-panel
          </div>
        </div>

        <div className="grid min-h-[420px] md:grid-cols-[0.5fr_1fr_0.9fr]">
          <div className="hidden border-r border-[rgba(26,24,20,0.08)] bg-[rgba(250,248,244,0.55)] p-4 md:block">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--ink-faint)]">Documents</div>
            <div className="mt-4 space-y-2">
              {["MSA_2024.pdf", "Security_Policy.docx", "Q3_Report.pdf"].map((doc, index) => (
                <div
                  key={doc}
                  className={`rounded-xl px-3 py-2 text-[10px] font-semibold ${index < 2 ? "border border-brand-200 bg-brand-50 text-brand-800" : "text-[var(--ink-muted)]"}`}
                >
                  {doc}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-dashed border-[rgba(26,24,20,0.12)] bg-white/60 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">
              Try sample docs
            </div>
          </div>

          <div className="relative border-r border-[rgba(26,24,20,0.08)] p-6">
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-none border border-[rgba(194,91,58,0.16)] bg-[linear-gradient(180deg,#fff7ef_0%,#f7e7d8_100%)] p-3 text-[11px] font-semibold text-[var(--ink)]">
                  What termination notice applies under Section 12?
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 shadow-lg shadow-brand-200">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="space-y-3 rounded-2xl rounded-tl-none border border-[rgba(26,24,20,0.08)] bg-white p-4 shadow-sm">
                  <p className="text-[11px] leading-6 text-[var(--ink-muted)]">
                    Section 12.3 requires <span className="rounded bg-brand-50 px-1 font-semibold text-brand-800">90 days written notice</span>. Early exit triggers a pro-rated fee per Exhibit B.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-1 rounded-full bg-[var(--sage-light)] px-2.5 py-1 text-[9px] font-black uppercase tracking-tighter text-[var(--sage)]">
                      <ShieldCheck size={10} />
                      MSA — p. 14
                    </div>
                    <div className="inline-flex rounded-full bg-[var(--sage-light)] px-2.5 py-1 text-[9px] font-black uppercase tracking-tighter text-[var(--sage)]">
                      Exhibit B — p. 2
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex h-10 items-center justify-between rounded-xl border border-[rgba(26,24,20,0.08)] bg-white px-4 shadow-inner">
              <div className="h-2 w-28 rounded bg-[rgba(26,24,20,0.06)]" />
              <div className="h-6 w-6 rounded-lg bg-brand-600 shadow-lg shadow-brand-200" />
            </div>
          </div>

          <div className="hidden flex-col bg-[rgba(245,239,231,0.65)] p-4 md:flex">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--ink-faint)]">Source preview</div>
              <div className="rounded-md bg-white px-2 py-0.5 text-[9px] font-bold text-brand-700">p. 14</div>
            </div>
            <div className="flex-1 space-y-2 rounded-xl border border-[rgba(26,24,20,0.08)] bg-white p-4">
              <div className="h-2 w-full rounded bg-[rgba(26,24,20,0.06)]" />
              <div className="h-2 w-11/12 rounded bg-[rgba(26,24,20,0.06)]" />
              <div className="relative rounded-lg border-l-4 border-brand-500 bg-brand-50 px-3 py-2">
                <p className="text-[10px] leading-5 text-brand-900">
                  Either party may terminate with ninety (90) days prior written notice…
                </p>
              </div>
              <div className="h-2 w-full rounded bg-[rgba(26,24,20,0.06)]" />
              <div className="h-2 w-4/5 rounded bg-[rgba(26,24,20,0.06)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-10 -left-10 -z-10 h-24 w-24 animate-float rounded-[2rem] bg-brand-500/10 blur-xl" />
      <div className="absolute -bottom-10 -right-10 -z-10 h-32 w-32 animate-float-delayed rounded-[3rem] bg-[rgba(74,103,65,0.10)] blur-xl" />
    </div>
  );
}
