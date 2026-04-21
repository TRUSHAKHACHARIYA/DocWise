"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function DashboardHeader() {
  const pathname = usePathname();
  
  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split('/').pop() || 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-20 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 px-10 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle (only visible on mobile) */}
        <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Simple Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-zinc-800 text-slate-500 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500/50 transition-all">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search documentation..." 
            className="bg-transparent border-none outline-none text-sm w-48 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        <ThemeToggle />

        {/* Notifications */}
        <button className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative group">
          <Bell size={20} className="group-hover:scale-110 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-zinc-950 rounded-full" />
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800 mx-2" />

        {/* Integration Button (Quick Action) */}
        <button className="hidden sm:flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all shadow-brand-500/20 active:scale-95">
          New Document
        </button>
      </div>
    </header>
  );
}
