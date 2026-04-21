"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  ShieldCheck,
  LayoutDashboard,
  Bell,
  Terminal
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import AuthGuard from "@/components/auth/AuthGuard";

const adminNavItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Security Logs", href: "/admin/logs", icon: Terminal },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <AuthGuard requireAdmin>
      <div className="flex min-h-screen bg-zinc-50 font-sans">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col h-screen sticky top-0">
          <div className="p-6 pb-2">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="font-black text-zinc-900 text-xl tracking-tighter">ADMIN</span>
                <p className="text-[10px] font-bold text-zinc-400 -mt-1 uppercase tracking-widest">DocWise Space</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 mt-8 space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    isActive 
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <div className="bg-zinc-900 rounded-2xl p-5 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full" />
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Logged in as</h4>
              <p className="text-sm font-bold truncate">{user?.name || "Admin"}</p>
              <button 
                onClick={logout}
                className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                <LogOut size={14} />
                Termimal Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
                {adminNavItems.find(item => item.href === pathname)?.name || "Administration"}
              </h2>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full border border-zinc-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">All Systems Nominal</span>
              </div>
              
              <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 border-2 border-white rounded-full" />
              </button>
              
              <div className="h-8 w-px bg-zinc-200" />
              
              <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-black text-xs">
                AD
              </div>
            </div>
          </header>

          <main className="p-10 animate-fade-in overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
