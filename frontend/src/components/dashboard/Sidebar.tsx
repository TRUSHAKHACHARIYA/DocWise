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
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUsage } from "@/hooks/useUsage";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: Files },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Billing", href: "/billing", icon: Zap },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { usage, questionPercentage } = useUsage();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center group-hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-600 to-cyan-500 blur-sm opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-10 h-10 bg-white rounded-xl border border-white/50 flex items-center justify-center shadow-md">
              <Sparkles size={20} className="text-brand-600" />
            </div>
          </div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">DocWise</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-brand-50 text-brand-600 shadow-sm shadow-brand-100/50" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={20} className={cn(
                "transition-colors",
                isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-soft" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Usage Indicator */}
      <div className="px-4 mb-6">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
              {user?.plan || "Free"} Plan
            </span>
            <Zap size={14} className={cn(
              "shrink-0",
              user?.plan === "PRO" ? "text-brand-500 fill-brand-500" : "text-amber-500 fill-amber-500"
            )} />
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-brand-500 transition-all duration-500" 
              style={{ width: `${questionPercentage}%` }} 
            />
          </div>
          <p className="mt-2.5 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
            {usage?.questionsUsed || 0} / {usage?.questionsLimit || 20} questions
          </p>
          {(user?.plan === "FREE" || !user?.plan) && (
            <Link href="/billing">
              <button className="mt-3 w-full py-2 text-[10px] font-black uppercase tracking-widest text-brand-600 bg-white border border-brand-200 rounded-xl hover:bg-brand-50 transition-all shadow-sm active:scale-95">
                Upgrade to Pro
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* User / Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || "user@example.com"}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <LogOut size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
