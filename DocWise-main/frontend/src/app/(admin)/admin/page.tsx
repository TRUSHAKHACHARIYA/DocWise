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
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const PLAN_COLORS: Record<string, string> = {
  FREE: '#94a3b8',
  STARTER: '#818cf8',
  PRO: '#6366f1',
  ENTERPRISE: '#312e81'
};

export default function AdminOverviewPage() {
  const { 
    stats, 
    growthData, 
    users, 
    fetchStats, 
    fetchGrowthData, 
    fetchUsers, 
    isLoading 
  } = useAdmin();

  useEffect(() => {
    fetchStats();
    fetchGrowthData();
    fetchUsers("", 1); // Get first batch of users for recent list
  }, []);

  const recentSignups = users.slice(0, 4);

  // Format date for the chart (MM/DD)
  const chartData = growthData?.history.map(day => ({
    ...day,
    formattedDate: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  })) || [];

  const pieData = stats?.planDistribution.map(p => ({
    name: p.plan,
    value: p.count
  })) || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={isLoading ? "..." : stats?.userCount?.toLocaleString() || "0"} 
          icon={<Users size={18} />} 
          trend={{ value: "Live", isUp: true }}
          color="brand"
        />
        <StatCard 
          title="Active (7d)" 
          value={isLoading ? "..." : stats?.activeUsers?.toLocaleString() || "0"} 
          icon={<Activity size={18} />} 
          color="emerald"
        />
        <StatCard 
          title="Documents" 
          value={isLoading ? "..." : stats?.docCount?.toLocaleString() || "0"} 
          icon={<FileText size={18} />} 
          color="purple"
        />
        <StatCard 
          title="Messages" 
          value={isLoading ? "..." : stats?.messageCount?.toLocaleString() || "0"} 
          icon={<ArrowRight size={18} />} 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Growth Analytics Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight leading-none mb-2">Growth Analytics</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Platform activity for the last 30 days</p>
            </div>
          </div>
          
          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group min-h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="formattedDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    dy={10}
                    interval={4}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                      fontSize: '11px',
                      fontWeight: '800'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    name="Signups"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="messages" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMessages)" 
                    name="Messages"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">Syncing Cloud Metrics...</p>
              </div>
            )}
          </div>
        </div>

        {/* Plan Distribution & Signups */}
        <div className="space-y-10">
          {/* Plan Distribution */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight leading-none mb-2">Plan Mix</h3>
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 h-64 flex items-center justify-center shadow-sm">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PLAN_COLORS[entry.name] || '#eee'} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: '800' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">Calculating market share...</div>}
                
                <div className="flex flex-col gap-3 ml-4">
                   {pieData.map(p => (
                     <div key={p.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAN_COLORS[p.name] }} />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter truncate w-16">{p.name}</span>
                        <span className="text-[10px] font-black text-zinc-900 ml-auto">{p.value}</span>
                     </div>
                   ))}
                </div>
            </div>
          </div>

          {/* Recent Signups */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight leading-none mb-2">Recent Signups</h3>
              <Link href="/admin/users" className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors">
                <ArrowRight size={18} className="text-zinc-600" />
              </Link>
            </div>

            <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden divide-y divide-zinc-100 shadow-sm">
              {recentSignups.map((signup) => (
                <div key={signup.id} className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold border border-zinc-200 group-hover:scale-110 transition-transform">
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
                  </div>
                </div>
              ))}
              <Link 
                href="/admin/users" 
                className="p-5 bg-zinc-50/50 hover:bg-zinc-100 text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest hover:text-zinc-900 transition-all block border-t border-zinc-100"
              >
                Full Directory
              </Link>
            </div>
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
