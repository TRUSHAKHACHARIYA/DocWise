import Link from "next/link";
import { FileText } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--cream)]">
      <header className="border-b border-[rgba(26,24,20,0.08)] bg-[var(--warm-white)]">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold">DocWise</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          {children}
        </div>
      </main>

      <footer className="border-t border-[rgba(26,24,20,0.08)] bg-[var(--warm-white)]">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-lg font-bold">DocWise</span>
          </Link>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--ink-faint)]">
            <Link href="/terms" className="hover:text-[var(--ink)] transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-[var(--ink)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-[var(--ink)] transition-colors">
              Home
            </Link>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
            DocWise &copy; 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
