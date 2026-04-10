"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  MessageSquare, 
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  FileText
} from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useDocuments } from "@/hooks/useDocuments";

export default function ChatPage() {
  const { user } = useAuth();
  const { 
    sessions, 
    activeSessionId, 
    setActiveSessionId, 
    messages, 
    isLoading, 
    isStreaming,
    fetchSessions, 
    sendMessage,
    createNewSession
  } = useChat();

  const { documents, loadDocuments } = useDocuments();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
    loadDocuments();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 relative">
      {/* Sidebar: Chat Sessions */}
      <div className={cn(
        "w-80 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm transition-all duration-300 z-20",
        !isSidebarOpen && "w-0 border-none opacity-0 -translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Conversations</h3>
          <Button onClick={createNewSession} size="sm" className="w-8 h-8 p-0 rounded-xl bg-slate-900 border-none">
            <Plus size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading && sessions.length === 0 ? (
            [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 rounded-2xl" />)
          ) : sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={cn(
                "w-full text-left p-4 rounded-2xl transition-all group relative overflow-hidden",
                activeSessionId === session.id 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "hover:bg-slate-50 text-slate-600 font-bold"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <MessageSquare size={18} className={activeSessionId === session.id ? "text-brand-400" : "text-slate-400"} />
                <span className="truncate flex-1 text-sm">{session.title}</span>
              </div>
            </button>
          ))}
          {!isLoading && sessions.length === 0 && (
            <div className="text-center p-8 text-slate-400 font-bold text-xs uppercase tracking-widest mt-10">
              No chats yet
            </div>
          )}
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm z-30 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm relative">
        {!activeSessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 animate-bounce">
              <BrainCircuit size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Ready to analyze?</h3>
            <p className="text-slate-500 font-medium max-w-xs mb-8 uppercase text-[10px] tracking-widest leading-relaxed">
              Select a previous conversation or start a new one to unlock the power of your documents.
            </p>
            <Button onClick={createNewSession} size="lg" className="rounded-2xl shadow-xl shadow-slate-100">
              New Conversation
            </Button>
          </div>
        ) : (
          <>
            {/* Messages would go here - abstracted to components previously */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === 'USER' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-[1.5rem]",
                    m.role === 'USER' ? "bg-slate-900 text-white rounded-tr-sm" : "bg-slate-50 text-slate-900 border border-slate-100 rounded-tl-sm"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex justify-start">
                  <Skeleton className="h-10 w-24 rounded-2xl rounded-tl-sm" />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar: Knowledge Base / Context Selector */}
      <div className="w-72 hidden xl:flex flex-col bg-slate-900 rounded-[2.5rem] p-6 text-white overflow-hidden shadow-2xl">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
          <FileText size={16} />
          Knowledge Base
        </h4>
        <div className="space-y-3 overflow-y-auto">
          {documents.map(doc => (
            <div key={doc.id} className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <p className="text-xs font-bold truncate mb-1">{doc.name}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500">{(doc.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <p className="text-[10px] font-bold text-slate-500 uppercase text-center mt-10 tracking-widest">No documents available</p>
          )}
        </div>
      </div>
    </div>
  );
}
