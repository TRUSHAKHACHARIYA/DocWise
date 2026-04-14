"use client";

import { 
  Users, 
  FileText, 
  CreditCard, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  UserPlus,
  ArrowRight
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminOverviewPage() {
  const { stats, users, fetchStats, fetchUsers, isLoading } = useAdmin();

  useEffect(() => {
    fetchStats();
    fetchUsers("", 1); // Get first batch of users for recent list
  }, []);

  const recentSignups = users.slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={isLoading ? "..." : stats?.userCount?.toLocaleString() || "0"} 
          icon={<Users size={24} />} 
          trend={{ value: "Live", isUp: true }}
          color="brand"
        />
        <StatCard 
          title="Active (7d)" 
          value={isLoading ? "..." : stats?.activeUsers?.toLocaleString() || "0"} 
          icon={<Activity size={24} />} 
          color="emerald"
        />
        <StatCard 
          title="Documents" 
          value={isLoading ? "..." : stats?.docCount?.toLocaleString() || "0"} 
          icon={<FileText size={24} />} 
          color="purple"
        />
        <StatCard 
          title="Messages" 
          value={isLoading ? "..." : stats?.messageCount?.toLocaleString() || "0"} 
          icon={<ArrowRight size={24} />} 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Growth Chart Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Growth Analytics</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[10px] font-black uppercase bg-zinc-900 text-white rounded-lg">Realtime</button>
              <button className="px-3 py-1 text-[10px] font-black uppercase bg-zinc-100 text-zinc-500 rounded-lg">7 Days</button>
            </div>
          </div>
          
          <div className="aspect-[2/1] bg-white border border-zinc-200 rounded-[2rem] p-8 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#4f46e510_0%,transparent_50%)]" />
            <div className="text-zinc-300 flex flex-col items-center">
              <BarChart3 size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold opacity-30 uppercase tracking-widest">Interactive Chart Data Coming Soon</p>
            </div>
          </div>
        </div>

        {/* Recent User Signups */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Recent Signups</h3>
            <Link href="/admin/users" className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors">
              <ArrowRight size={18} className="text-zinc-600" />
            </Link>
          </div>

          <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden divide-y divide-zinc-100">
            {recentSignups.map((signup) => (
              <div key={signup.id} className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold border border-zinc-200">
                    {signup.name?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-black text-zinc-900 truncate">{signup.name}</h5>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">{signup.email}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                    signup.plan === 'ENTERPRISE' ? "bg-purple-100 text-purple-700" : signup.plan === 'PRO' ? "bg-brand-100 text-brand-700" : "bg-zinc-100 text-zinc-500"
                  )}>
                    {signup.plan}
                  </span>
                  <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase">
                    {new Date(signup.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentSignups.length === 0 && !isLoading && (
              <div className="p-10 text-center text-zinc-400 font-bold text-xs">No users found.</div>
            )}
            {isLoading && (
              <div className="p-10 text-center text-zinc-400 animate-pulse">Loading users...</div>
            )}
            <Link 
              href="/admin/users" 
              className="p-5 bg-zinc-50/50 hover:bg-zinc-100 text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest hover:text-zinc-600 transition-all block"
            >
              Manage all users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const BarChart3 = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);
