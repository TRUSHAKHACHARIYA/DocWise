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
        {/* Usage Over Time Placeholder */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Daily Active Users</h3>
          <div className="h-[400px] bg-white border border-zinc-200 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-zinc-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-300 mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 size={32} />
            </div>
            <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Visual Data Pipeline Loading...</p>
            <div className="mt-8 flex gap-3">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div 
                  key={i} 
                  className="w-8 bg-zinc-900 rounded-t-lg transition-all duration-1000" 
                  style={{ height: `${h}px` }} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Revenue Distribution</h3>
          <div className="h-[400px] bg-white border border-zinc-200 rounded-[3rem] p-10 space-y-8">
            {[
              { label: 'Free Tier', value: 65, color: 'bg-zinc-200' },
              { label: 'Pro Monthly', value: 24, color: 'bg-brand-500' },
              { label: 'Enterprise', value: 11, color: 'bg-zinc-900' },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{item.label}</p>
                  <p className="text-lg font-black text-zinc-900 italic">{item.value}%</p>
                </div>
                <div className="h-4 w-full bg-zinc-50 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                    style={{ width: `${item.value}%` }} 
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
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
