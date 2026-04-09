"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";

export default function DashboardHeader() {
  const pathname = usePathname();
  
  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split('/').pop() || 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle (only visible on mobile) */}
        <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Simple Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-slate-500 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500/50 transition-all">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search documentation..." 
            className="bg-transparent border-none outline-none text-sm w-48 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2" />

        {/* Integration Button (Quick Action) */}
        <button className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all shadow-brand-200 active:scale-95">
          New Document
        </button>
      </div>
    </header>
  );
}
