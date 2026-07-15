"use client";

import { useEffect } from "react";
import {
  TrendingUp,
  MousePointer2,
  MessageSquare,
  Users,
  Calendar,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Skeleton from "@/components/ui/Skeleton";
import { useAdmin } from "@/hooks/useAdmin";
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
  Cell,
} from "recharts";

const PLAN_COLORS: Record<string, string> = {
  FREE: "#94a3b8",
  STARTER: "#818cf8",
  PRO: "#6366f1",
  ENTERPRISE: "#312e81",
};

export default function AdminAnalyticsPage() {
  const {
    analyticsSummary,
    growthData,
    isLoading,
    fetchAnalyticsSummary,
    fetchGrowthData,
  } = useAdmin();

  useEffect(() => {
    fetchAnalyticsSummary();
    fetchGrowthData();
  }, []);

  const chartData =
    growthData?.history.map((day) => ({
      ...day,
      formattedDate: new Date(day.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    })) ?? [];

  const pieData =
    analyticsSummary?.planDistribution.map((entry) => ({
      name: entry.plan,
      value: entry.count,
      color: PLAN_COLORS[entry.plan] ?? "#cbd5e1",
    })) ?? [];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">
            Platform Analytics
          </h2>
          <p className="text-zinc-500 font-bold mt-1 uppercase text-xs tracking-widest">
            Live metrics from your database
          </p>
        </div>
        <div className="flex items-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 rounded-2xl shadow-sm text-sm font-bold text-zinc-600">
          <Calendar size={18} />
          Last 30 Days
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Conversion Rate"
          value={isLoading ? "..." : `${analyticsSummary?.conversionRate ?? 0}%`}
          icon={<TrendingUp size={24} />}
          color="brand"
        />
        <StatCard
          title="Avg. Chat Length"
          value={isLoading ? "..." : `${analyticsSummary?.avgChatLength ?? 0} msg`}
          icon={<MousePointer2 size={24} />}
          color="purple"
        />
        <StatCard
          title="Questions (30d)"
          value={
            isLoading
              ? "..."
              : (analyticsSummary?.questionsLast30Days ?? 0).toLocaleString()
          }
          icon={<MessageSquare size={24} />}
          color="amber"
        />
        <StatCard
          title="Total Users"
          value={
            isLoading ? "..." : (analyticsSummary?.totalUsers ?? 0).toLocaleString()
          }
          icon={<Users size={24} />}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
            Daily Messages
          </h3>
          <div className="h-[400px] bg-white border border-zinc-200 rounded-[3rem] p-10 relative overflow-hidden">
            {isLoading && chartData.length === 0 ? (
              <Skeleton className="h-full w-full rounded-[2rem]" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="formattedDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: "bold" }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "1rem",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ fontWeight: "black", textTransform: "uppercase" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke="#6366f1"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorMessages)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-bold text-zinc-400 uppercase tracking-widest">
                No activity yet
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">
            Plan Distribution
          </h3>
          <div className="h-[400px] bg-white border border-zinc-200 rounded-[3rem] p-10 flex flex-col items-center justify-center relative">
            {isLoading && pieData.length === 0 ? (
              <Skeleton className="h-full w-full rounded-[2rem]" />
            ) : pieData.length > 0 ? (
              <>
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
                      contentStyle={{
                        borderRadius: "1rem",
                        border: "none",
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute bottom-10 left-10 right-10 pt-6 border-t border-zinc-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Paid Users
                    </p>
                    <p className="text-2xl font-black text-zinc-900">
                      {analyticsSummary?.paidUsers ?? 0}
                    </p>
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {analyticsSummary?.totalUsers ?? 0} total
                  </p>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-bold text-zinc-400 uppercase tracking-widest">
                No users yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
