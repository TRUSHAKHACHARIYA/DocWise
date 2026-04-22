"use client";

import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Zap, 
  MousePointer2,
  Calendar,
  ChevronDown
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const data = [
  { name: 'Mon', users: 4000 },
  { name: 'Tue', users: 3000 },
  { name: 'Wed', users: 2000 },
  { name: 'Thu', users: 2780 },
  { name: 'Fri', users: 1890 },
  { name: 'Sat', users: 2390 },
  { name: 'Sun', users: 3490 },
];

const pieData = [
  { name: 'Free Tier', value: 65, color: '#e2e8f0' },
  { name: 'Pro Monthly', value: 24, color: '#6366f1' },
  { name: 'Enterprise', value: 11, color: '#0f172a' },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">Platform Analytics</h2>
          <p className="text-zinc-500 font-bold mt-1 uppercase text-xs tracking-widest">Real-time performance and usage metrics</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 rounded-2xl shadow-sm text-sm font-bold text-zinc-600">
          <Calendar size={18} />
          Last 30 Days
          <ChevronDown size={14} className="ml-2" />
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Conversion Rate" value="3.2%" icon={<TrendingUp size={24} />} trend={{ value: "0.4%", isUp: true }} color="brand" />
        <StatCard title="Avg. Chat Length" value="8.4 msg" icon={<MousePointer2 size={24} />} trend={{ value: "1.2", isUp: true }} color="purple" />
        <StatCard title="Response Time" value="1.8s" icon={<Clock size={24} />} trend={{ value: "0.2s", isUp: false }} color="amber" />
        <StatCard title="Compute Usage" value="45%" icon={<Zap size={24} />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage Over Time */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Daily Active Users</h3>
          <div className="h-[400px] bg-white border border-zinc-200 rounded-[3rem] p-10 relative overflow-hidden group">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Revenue Distribution</h3>
          <div className="h-[400px] bg-white border border-zinc-200 rounded-[3rem] p-10 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute bottom-10 left-10 right-10 pt-6 border-t border-zinc-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Estimated MRR</p>
                <p className="text-2xl font-black text-zinc-900">$14,280</p>
              </div>
              <button className="px-5 py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all">
                Full Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
