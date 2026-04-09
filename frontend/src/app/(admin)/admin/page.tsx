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

export default function AdminOverviewPage() {
  const recentSignups = [
    { id: 1, name: "Alex Johnson", email: "alex@example.com", plan: "Pro", date: "5m ago" },
    { id: 2, name: "Sarah Miller", email: "sarah.m@gmail.com", plan: "Free", date: "12m ago" },
    { id: 3, name: "Data Corp", email: "admin@datacorp.io", plan: "Enterprise", date: "1h ago" },
    { id: 4, name: "Michael Chen", email: "mchen@uni.edu", plan: "Free", date: "3h ago" },
  ];

  return (
    <div className="space-y-10">
      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value="1,284" 
          icon={<Users size={24} />} 
          trend={{ value: "12%", isUp: true }}
          color="brand"
        />
        <StatCard 
          title="Active Subscriptions" 
          value="452" 
          icon={<CreditCard size={24} />} 
          trend={{ value: "8%", isUp: true }}
          color="emerald"
        />
        <StatCard 
          title="Documents Processed" 
          value="12,402" 
          icon={<FileText size={24} />} 
          trend={{ value: "24%", isUp: true }}
          color="purple"
        />
        <StatCard 
          title="API Latency" 
          value="142ms" 
          icon={<Activity size={24} />} 
          trend={{ value: "4ms", isUp: false }}
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
                    {signup.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-zinc-900">{signup.name}</h5>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{signup.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                    signup.plan === 'Enterprise' ? "bg-purple-100 text-purple-700" : signup.plan === 'Pro' ? "bg-brand-100 text-brand-700" : "bg-zinc-100 text-zinc-500"
                  )}>
                    {signup.plan}
                  </span>
                  <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase">{signup.date}</p>
                </div>
              </div>
            ))}
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
