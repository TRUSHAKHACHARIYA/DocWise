"use client";

import { 
  FileText, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Plus, 
  ArrowRight,
  TrendingUp,
  FileCheck2,
  BrainCircuit
} from "lucide-react";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  // Mock data for initial UI
  const recentChats = [
    { id: 1, title: "Q3 Financial Analysis", date: "2 hours ago", messages: 14 },
    { id: 2, title: "Employment Contract Review", date: "Yesterday", messages: 6 },
    { id: 3, title: "Product Technical Specs", date: "3 days ago", messages: 21 },
  ];

  const recentDocs = [
    { id: 1, name: "annual_report_2023.pdf", size: "2.4 MB", status: "Ready" },
    { id: 2, name: "legal_terms_v2.docx", size: "1.1 MB", status: "Ready" },
    { id: 3, name: "onboarding_guide.pdf", size: "4.8 MB", status: "Processing" },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hi, {user?.name || "there"}! 👋
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Here's what's happening with your documents today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/chat">
            <Button variant="outline" className="gap-2">
              <MessageSquare size={18} />
              New Chat
            </Button>
          </Link>
          <Link href="/documents">
            <Button className="gap-2 shadow-lg shadow-brand-200">
              <Plus size={18} />
              Upload Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Documents" 
          value={12} 
          icon={<FileText size={24} />} 
          description="Total uploaded"
          trend={{ value: "2", isUp: true }}
          color="brand"
        />
        <StatCard 
          title="Questions" 
          value={142} 
          icon={<BrainCircuit size={24} />} 
          description="AI interactions"
          trend={{ value: "12%", isUp: true }}
          color="purple"
        />
        <StatCard 
          title="Accuracy" 
          value="98.2%" 
          icon={<ShieldCheck size={24} />} 
          description="Verified sources"
          color="emerald"
        />
        <StatCard 
          title="Time Saved" 
          value="4.5h" 
          icon={<Clock size={24} />} 
          description="This week"
          trend={{ value: "1.2h", isUp: true }}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Chats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-500" />
              Recent Conversations
            </h3>
            <Link href="/chat" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              View all
            </Link>
          </div>

          <div className="grid gap-4">
            {recentChats.map((chat) => (
              <Link 
                key={chat.id} 
                href={`/chat/${chat.id}`}
                className="group p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-brand-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center text-slate-500 group-hover:text-brand-600 transition-colors">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{chat.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{chat.messages} messages • {chat.date}</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-brand-500 transition-all group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Document Status / Uploads */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 size={20} className="text-emerald-500" />
              Recent Documents
            </h3>
            <Link href="/documents" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Manage
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-100 flex flex-col">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 truncate max-w-[140px] uppercase">
                      {doc.name.split('.')[0]}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-bold">{doc.size} • {doc.name.split('.').pop()}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  doc.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
            <Link 
              href="/documents" 
              className="p-4 bg-slate-50/50 hover:bg-slate-100 text-center text-sm font-bold text-slate-600 transition-colors"
            >
              Upload more documents
            </Link>
          </div>

          {/* Upgrade Prompt */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={80} className="fill-white" />
            </div>
            <h4 className="text-lg font-bold mb-2 relative z-10">Running low on credits?</h4>
            <p className="text-slate-400 text-sm mb-4 relative z-10">Get unlimited questions and multi-document chat with Pro.</p>
            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold border-none relative z-10">
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Zap = ({ size, className }: { size: number, className?: string }) => (
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
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
