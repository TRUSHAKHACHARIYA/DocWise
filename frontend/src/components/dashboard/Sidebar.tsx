"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Files,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  GitCompare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUsage } from "@/hooks/useUsage";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: Files },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Compare", href: "/compare", icon: GitCompare },
  { name: "Billing", href: "/billing", icon: Zap },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { usage, questionPercentage } = useUsage();

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] lg:flex">
      <Link href="/dashboard" className="flex items-center gap-3 border-b border-[rgba(26,24,20,0.10)] px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--cream)]">
          <Sparkles size={16} />
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-[var(--ink)]">DocWise</span>
      </Link>

      <nav className="flex-1 px-3 py-4">
        <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">Main</div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--rust-light)] text-[var(--rust-dark)]"
                    : "text-[var(--ink-muted)] hover:bg-[rgba(26,24,20,0.05)] hover:text-[var(--ink)]"
                )}
              >
                <Icon size={18} className={cn(isActive ? "text-[var(--rust)]" : "text-[var(--ink-faint)]")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-[rgba(26,24,20,0.10)] bg-[var(--cream)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">Monthly questions</span>
            <span className="text-xs font-bold text-[var(--ink)]">{questionPercentage}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(26,24,20,0.10)]">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${questionPercentage}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-[var(--ink-muted)]">
            {usage?.questionsUsed || 0} / {usage?.questionsLimit || 20} questions
          </p>
          {(user?.plan === "FREE" || !user?.plan) && (
            <Link href="/billing" className="mt-3 block">
              <button className="w-full rounded-xl border border-[rgba(26,24,20,0.12)] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--rust-dark)] transition-colors hover:bg-[var(--rust-light)]">
                Upgrade to Pro
              </button>
            </Link>
          )}
        </div>
      </nav>

      <div className="border-t border-[rgba(26,24,20,0.10)] px-4 py-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--rust-light)] font-bold text-[var(--rust)]">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--ink)]">{user?.name || "User"}</p>
            <p className="truncate text-xs text-[var(--ink-faint)]">{user?.email || "user@example.com"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:bg-[rgba(26,24,20,0.05)] hover:text-[var(--rust-dark)]"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
