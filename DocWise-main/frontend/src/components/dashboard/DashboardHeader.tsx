"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function DashboardHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    const segment = pathname.split("/").filter(Boolean).pop() || "Dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[rgba(26,24,20,0.10)] bg-[rgba(255,253,249,0.85)] px-6 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-4">
        <button className="rounded-xl p-2 text-[var(--ink-muted)] transition-colors hover:bg-[rgba(26,24,20,0.05)] lg:hidden">
          <Menu size={18} />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight text-[var(--ink)]">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-[var(--ink-faint)]">DocWise workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-[rgba(26,24,20,0.10)] bg-[var(--cream)] px-3 py-2 text-[13px] text-[var(--ink-faint)] md:flex">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-44 border-none bg-transparent outline-none placeholder:text-[var(--ink-faint)]"
          />
        </div>
        <ThemeToggle />
        <button className="relative rounded-full p-2.5 text-[var(--ink-muted)] transition-colors hover:bg-[rgba(26,24,20,0.05)]">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[var(--warm-white)] bg-brand-500" />
        </button>
      </div>
    </header>
  );
}
