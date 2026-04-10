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
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { sessions, fetchSessions, isLoading: chatLoading } = useChat();
  const { documents, loadDocuments, isLoading: docsLoading } = useDocuments();
  const { usage, isLoading: usageLoading } = useUsage();

  useEffect(() => {
    fetchSessions();
    loadDocuments();
  }, []);

  const isLoading = chatLoading || docsLoading || usageLoading;
  const recentChats = sessions.slice(0, 3);
  const recentDocs = documents.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {isLoading ? (
            <Skeleton variant="text" className="w-48 h-10 mb-2" />
          ) : (
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hi, {user?.name || "there"}! 👋
            </h2>
          )}
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
          value={usageLoading ? "..." : usage?.docsUploaded || 0} 
          icon={<FileText size={24} />} 
          description="Total uploaded"
          color="brand"
        />
        <StatCard 
          title="Questions" 
          value={usageLoading ? "..." : usage?.questionsUsed || 0} 
          icon={<BrainCircuit size={24} />} 
          description="AI interactions"
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
          title="Limit" 
          value={usageLoading ? "..." : usage?.questionsLimit || 20} 
          icon={<Clock size={24} />} 
          description="Monthly quota"
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
            {chatLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)
            ) : (
              recentChats.map((chat) => (
                <Link 
                  key={chat.id} 
                  href="/chat"
                  className="group p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-brand-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center text-slate-500 group-hover:text-brand-600 transition-colors">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate max-w-[200px]">
                        {chat.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-brand-500 transition-all group-hover:translate-x-1" />
                </Link>
              ))
            )}
            {!chatLoading && recentChats.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm">
                No conversations yet. Start chatting now!
              </div>
            )}
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
            {docsLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-14 mx-4 my-2" />)
            ) : (
              recentDocs.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-sm font-bold text-slate-900 truncate">
                        {doc.name}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-bold">{(doc.sizeBytes / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest leading-none shrink-0",
                    doc.status === 'READY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {doc.status.toLowerCase()}
                  </span>
                </div>
              ))
            )}
            {!docsLoading && recentDocs.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-bold text-xs">
                No documents uploaded.
              </div>
            )}
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
            <Link href="/billing">
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold border-none relative z-10">
                Upgrade Now
              </Button>
            </Link>
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
