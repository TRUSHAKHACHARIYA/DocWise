"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, BookOpen, Key, Search, FolderOpen, Package } from "lucide-react";

const navItems = [
  { href: "/developers", label: "Overview", icon: BookOpen },
  { href: "/developers/getting-started", label: "Getting Started", icon: Package },
  { href: "/developers/authentication", label: "Authentication", icon: Key },
  { href: "/developers/retrieve", label: "Retrieve API", icon: Search },
  { href: "/developers/api-docs", label: "Documents API", icon: FolderOpen },
  { href: "/developers/sdk", label: "SDK Reference", icon: FileText },
];

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[var(--cream)]">
      <aside className="hidden lg:flex flex-col w-64 border-r border-[rgba(26,24,20,0.08)] bg-[var(--warm-white)] p-6">
        <Link href="/" className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold">DocWise</span>
          <span className="text-xs font-mono bg-[var(--ink)] text-[var(--cream)] px-2 py-0.5 rounded">
            API
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/developers"
                ? pathname === "/developers"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-[var(--ink-muted)] hover:bg-[rgba(26,24,20,0.04)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-[rgba(26,24,20,0.08)]">
          <Link
            href="/dashboard"
            className="text-xs text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl px-6 py-10 lg:px-12 lg:py-14">
          {children}
        </div>
      </main>
    </div>
  );
}
