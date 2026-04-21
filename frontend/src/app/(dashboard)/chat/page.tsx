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
import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";
import PDFViewer from "@/components/chat/PDFViewer";
import { Source } from "@/components/chat/SourceCard";

export default function ChatPage() {
  const { user } = useAuth();
  const [activePdf, setActivePdf] = useState<Source | null>(null);
  const { 
    sessions, 
    activeSessionId, 
    setActiveSessionId, 
    messages, 
    isLoading, 
    isStreaming,
    fetchSessions, 
    sendMessage,
    createSession,
    updateSessionDocuments
  } = useChat();

  const { documents, loadDocuments } = useDocuments();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
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

  const handleNewSession = async () => {
    await createSession("New Conversation", selectedDocIds);
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocIds(prev => {
      const newSelection = prev.includes(docId) 
        ? prev.filter(id => id !== docId) 
        : [...prev, docId];
      
      // If we are in an active session, update it on the backend too
      if (activeSessionId) {
        updateSessionDocuments(activeSessionId, newSelection);
      }
      return newSelection;
    });
  };

  const handleSourceClick = (source: Source) => {
    setActivePdf(source);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 relative">
      {/* PDF Viewer Overlay */}
      {activePdf && activePdf.documentId && (
        <PDFViewer 
          documentId={activePdf.documentId}
          documentName={activePdf.title}
          initialPage={activePdf.page}
          initialSearch={activePdf.excerpt}
          onClose={() => setActivePdf(null)}
        />
      )}

      {/* Sidebar: Chat Sessions */}
      <div className={cn(
        "w-80 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm transition-all duration-300 z-20",
        !isSidebarOpen && "w-0 border-none opacity-0 -translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Conversations</h3>
          <Button onClick={handleNewSession} size="sm" className="w-8 h-8 p-0 rounded-xl bg-slate-900 border-none">
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
            <Button onClick={handleNewSession} size="lg" className="rounded-2xl shadow-xl shadow-slate-100">
              New Conversation
            </Button>
          </div>
        ) : (
          <>
            {/* Header info about documents */}
            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                   {selectedDocIds.slice(0, 3).map(id => (
                     <div key={id} className="w-6 h-6 rounded-full bg-brand-100 border-2 border-white flex items-center justify-center">
                        <FileText size={10} className="text-brand-600" />
                     </div>
                   ))}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {selectedDocIds.length} Document(s) active
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8" ref={scrollRef}>
              {messages.map((m) => (
                <MessageBubble 
                  key={m.id} 
                  message={{
                    role: m.role === 'USER' ? 'user' : 'ai',
                    content: m.content,
                    sources: m.sources as any,
                    isStreaming: isStreaming && m.id === messages[messages.length - 1].id && m.role === 'ASSISTANT'
                  }} 
                  onSourceClick={handleSourceClick}
                />
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-gradient-to-t from-white via-white to-transparent">
              <ChatInput 
                onSend={sendMessage} 
                isLoading={isStreaming} 
              />
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar: Knowledge Base / Context Selector */}
      <div className="w-72 hidden xl:flex flex-col bg-slate-900 rounded-[2.5rem] p-6 text-white overflow-hidden shadow-2xl transition-all">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
          <FileText size={16} />
          Context Selection
        </h4>
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {documents.map(doc => (
            <div 
              key={doc.id} 
              onClick={() => toggleDocSelection(doc.id)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                selectedDocIds.includes(doc.id)
                  ? "bg-brand-600 border-brand-500 shadow-lg shadow-brand-500/20"
                  : "bg-white/5 border-white/5 hover:bg-white/10"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <p className={cn(
                  "text-xs font-bold truncate pr-6",
                  selectedDocIds.includes(doc.id) ? "text-white" : "text-slate-200"
                )}>
                  {doc.name}
                </p>
                {selectedDocIds.includes(doc.id) && (
                  <div className="absolute right-3 top-3 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500">
                  {(doc.sizeBytes / 1024 / 1024).toFixed(1)} MB
                </span>
                <span className={cn(
                  "text-[9px] font-bold uppercase",
                  selectedDocIds.includes(doc.id) ? "text-brand-200" : "text-slate-600"
                )}>
                  {selectedDocIds.includes(doc.id) ? "Selected" : "Exclude"}
                </span>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-20 text-center px-4">
              <Plus className="text-slate-600 mb-4 h-8 w-8" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                Connect your documents first to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
