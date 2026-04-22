"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  MessageSquare, 
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  FileText,
  Download,
  MoreVertical,
  Pencil,
  Trash2
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
    deleteSession,
    renameSession,
    updateSessionDocuments
  } = useChat();

  const { documents, loadDocuments } = useDocuments();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    if (!messages.length) return;
    
    // Simple Markdown generation
    const content = messages.map(m => {
      const role = m.role === 'USER' ? '👤 YOU' : '🤖 DOCWISE';
      const timestamp = new Date(m.createdAt).toLocaleString();
      return `### ${role} (${timestamp})\n${m.content}\n\n---\n`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docwise-chat-${activeSessionId}-${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Chat Exported", "Your conversation has been saved as a Markdown file.");
  };

  const isExportEligible = user?.plan !== 'FREE' || user?.role === 'ADMIN';

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

  const handleRename = async (sessionId: string) => {
    if (!newTitle.trim()) return;
    await renameSession(sessionId, newTitle);
    setRenamingSessionId(null);
    setNewTitle("");
  };

  const startRenaming = (session: any) => {
    setRenamingSessionId(session.id);
    setNewTitle(session.title);
    setActiveMenuId(null);
  };

  const handleDelete = async (sessionId: string) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      await deleteSession(sessionId);
    }
    setActiveMenuId(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        "w-80 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm transition-all duration-300 z-20",
        !isSidebarOpen && "w-0 border-none opacity-0 -translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">Conversations</h3>
          <Button onClick={handleNewSession} size="sm" className="w-8 h-8 p-0 rounded-xl bg-slate-900 dark:bg-brand-600 border-none">
            <Plus size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isLoading && sessions.length === 0 ? (
            [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)
          ) : sessions.map((session) => (
            <div key={session.id} className="relative group/item">
              {renamingSessionId === session.id ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-brand-500">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(session.id);
                      if (e.key === "Escape") setRenamingSessionId(null);
                    }}
                    className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setRenamingSessionId(null)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Cancel</button>
                    <button onClick={() => handleRename(session.id)} className="text-[10px] font-black uppercase text-brand-600">Save</button>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all relative overflow-hidden flex items-center gap-3 cursor-pointer",
                    activeSessionId === session.id 
                      ? "bg-slate-900 dark:bg-brand-600 text-white shadow-lg shadow-slate-200 dark:shadow-brand-950/20" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold"
                  )}
                  onClick={() => setActiveSessionId(session.id)}
                >
                  <MessageSquare size={18} className={activeSessionId === session.id ? "text-brand-400 dark:text-brand-200" : "text-slate-400"} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm">{session.title}</div>
                    <div className={cn(
                      "text-[9px] font-medium opacity-60 mt-0.5",
                      activeSessionId === session.id ? "text-slate-300" : "text-slate-400"
                    )}>
                      {new Date(session.updatedAt || session.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === session.id ? null : session.id);
                    }}
                    className={cn(
                      "p-1 rounded-lg hover:bg-white/10 transition-colors",
                      activeSessionId === session.id ? "text-white" : "text-slate-400"
                    )}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === session.id && (
                    <div 
                      ref={menuRef}
                      className="absolute right-4 top-12 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => startRenaming(session)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Pencil size={14} />
                        Rename
                      </button>
                      <button 
                        onClick={() => handleDelete(session.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {!isLoading && sessions.length === 0 && (
            <div className="text-center p-8 text-slate-400 font-bold text-xs uppercase tracking-widest mt-10">
              No chats yet
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm relative transition-colors">
        {!activeSessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6 animate-bounce">
              <BrainCircuit size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Ready to analyze?</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mb-8 uppercase text-[10px] tracking-widest leading-relaxed">
              Select a previous conversation or start a new one to unlock the power of your documents.
            </p>
            <Button onClick={handleNewSession} size="lg" className="rounded-2xl shadow-xl shadow-slate-100 dark:shadow-brand-950/20">
              New Conversation
            </Button>
          </div>
        ) : (
          <>
            {/* Header info about documents */}
            <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                   {selectedDocIds.slice(0, 3).map(id => (
                     <div key={id} className="w-7 h-7 rounded-full bg-brand-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 flex items-center justify-center shadow-sm">
                        <FileText size={12} className="text-brand-600 dark:text-brand-400" />
                     </div>
                   ))}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {selectedDocIds.length} Document(s) active
                </span>
              </div>

              <div className="flex items-center gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={handleExport}
                   disabled={messages.length === 0 || !isExportEligible}
                   className="gap-2 text-[10px] uppercase font-black tracking-widest rounded-xl border-slate-200 dark:border-zinc-800"
                 >
                   <Download size={14} />
                   Export Chat
                   {!isExportEligible && <span className="ml-1 text-[8px] opacity-50 px-1 bg-amber-100 text-amber-700 rounded-sm">PRO</span>}
                 </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20" ref={scrollRef}>
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
            <div className="p-6 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent">
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
