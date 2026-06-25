import { ReactNode } from "react";
import Link from "next/link";
import { FileText, Sparkles, Shield, Zap, GitCompare, PanelRight } from "lucide-react";

const features = [
  { icon: PanelRight, label: "3-panel chat with embedded PDF citations" },
  { icon: GitCompare, label: "Compare two documents with cited excerpts" },
  { icon: Zap, label: "Sample docs & suggested prompts—value in under a minute" },
  { icon: Shield, label: "Private workspaces with audit logs & RBAC" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--cream)]">
      <aside className="hidden lg:flex flex-col justify-between bg-[var(--ink)] text-[var(--cream)] p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-60px] w-72 h-72 rounded-full bg-[rgba(74,103,65,0.10)] blur-3xl" />

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg">
            <FileText size={18} className="text-white" />
          </div>
          <span className="font-display text-2xl font-bold">DocWise</span>
        </Link>

        <div className="relative z-10 max-w-xl">
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight">
            Your documents,
            <br />
            <em className="italic text-brand-100">finally speak.</em>
          </h1>
          <p className="mt-5 text-white/60 text-base leading-7 max-w-lg">
            Multi-document chat with cited answers, a 3-panel citation workspace, and document comparison—built for teams that need evidence, not guesswork.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.label} className="flex items-center gap-3 text-white/70 text-sm">
                <span className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                  <Icon size={14} />
                </span>
                <span>{feature.label}</span>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-10 lg:px-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-[var(--ink)]">DocWise</span>
          </div>

          <div className="rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[rgba(255,253,249,0.76)] backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(26,24,20,0.12)] p-8 sm:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
