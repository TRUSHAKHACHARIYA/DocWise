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
import { toast } from "@/store/toastStore";
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
        "w-80 flex flex-col bg-[var(--warm-white)] border border-[rgba(26,24,20,0.10)] rounded-[2.5rem] overflow-hidden shadow-sm transition-all duration-300 z-20",
        !isSidebarOpen && "w-0 border-none opacity-0 -translate-x-full"
      )}>
        <div className="flex items-center justify-between border-b border-[rgba(26,24,20,0.08)] p-6">
          <h3 className="text-lg font-black uppercase tracking-tighter text-[var(--ink)]">Conversations</h3>
          <Button onClick={handleNewSession} size="sm" className="h-8 w-8 rounded-xl border-none bg-[var(--rust)] p-0 shadow-lg shadow-[rgba(194,91,58,0.18)]">
            <Plus size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isLoading && sessions.length === 0 ? (
            [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)
          ) : sessions.map((session) => (
            <div key={session.id} className="relative group/item">
              {renamingSessionId === session.id ? (
                <div className="rounded-2xl border-2 border-[var(--rust)] bg-[var(--cream)] p-3">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(session.id);
                      if (e.key === "Escape") setRenamingSessionId(null);
                    }}
                    className="w-full bg-transparent border-none text-sm font-bold text-[var(--ink)] outline-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setRenamingSessionId(null)} className="text-[10px] font-black uppercase text-[var(--ink-faint)] transition-colors hover:text-[var(--ink-muted)]">Cancel</button>
                    <button onClick={() => handleRename(session.id)} className="text-[10px] font-black uppercase text-brand-600">Save</button>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "relative flex w-full cursor-pointer items-center gap-3 rounded-2xl p-4 text-left transition-all overflow-visible",
                    activeSessionId === session.id 
                      ? "bg-[var(--rust)] text-white shadow-lg shadow-[rgba(194,91,58,0.22)]" 
                      : "font-bold text-[var(--ink-muted)] hover:bg-[var(--cream)]"
                  )}
                  onClick={() => setActiveSessionId(session.id)}
                >
                  <MessageSquare size={18} className={activeSessionId === session.id ? "text-[#ffe1d4]" : "text-[var(--ink-faint)]"} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm">{session.title}</div>
                    <div className={cn(
                      "text-[9px] font-medium opacity-60 mt-0.5",
                      activeSessionId === session.id ? "text-[#f5d7cb]" : "text-[var(--ink-faint)]"
                    )}>
                      {new Date(session.updatedAt || session.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === session.id ? null : session.id);
                    }}
                    aria-label={`Open options for ${session.title}`}
                    title="Conversation options"
                    className={cn(
                      "rounded-lg p-1.5 transition-colors",
                      activeSessionId === session.id ? "text-white hover:bg-white/10" : "text-[var(--ink-faint)] hover:bg-[rgba(26,24,20,0.06)]"
                    )}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === session.id && (
                    <div 
                      ref={menuRef}
                      className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-40 overflow-hidden rounded-2xl border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] p-1 shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => startRenaming(session)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-[var(--ink-muted)] transition-colors hover:bg-[var(--cream)]"
                      >
                        <Pencil size={14} />
                        Rename
                      </button>
                      <button 
                        onClick={() => handleDelete(session.id)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
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
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[2.5rem] border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] shadow-sm transition-colors">
        {!activeSessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[var(--cream)] text-[var(--ink-faint)] animate-bounce">
              <BrainCircuit size={40} />
            </div>
            <h3 className="mb-2 text-2xl font-black uppercase tracking-tight text-[var(--ink)]">Ready to analyze?</h3>
            <p className="mb-8 max-w-xs text-[10px] font-medium uppercase leading-relaxed tracking-widest text-[var(--ink-muted)]">
              Select a previous conversation or start a new one to unlock the power of your documents.
            </p>
            <Button onClick={handleNewSession} size="lg" className="rounded-2xl shadow-xl shadow-[rgba(194,91,58,0.16)]">
              New Conversation
            </Button>
          </div>
        ) : (
          <>
            {/* Header info about documents */}
            <div className="flex items-center justify-between border-b border-[rgba(26,24,20,0.08)] bg-[var(--warm-white)] px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                   {selectedDocIds.slice(0, 3).map(id => (
                     <div key={id} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--warm-white)] bg-[var(--rust-light)] shadow-sm">
                        <FileText size={12} className="text-[var(--rust-dark)]" />
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
                   className="gap-2 rounded-xl border-[rgba(26,24,20,0.10)] text-[10px] font-black uppercase tracking-widest"
                 >
                   <Download size={14} />
                   Export Chat
                   {!isExportEligible && <span className="ml-1 text-[8px] opacity-50 px-1 bg-amber-100 text-amber-700 rounded-sm">PRO</span>}
                 </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="custom-scrollbar flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,250,242,0.92),rgba(250,241,230,0.78))] p-8" ref={scrollRef}>
              {messages.map((m) => (
                <MessageBubble 
                  key={m.id} 
                  message={{
                    id: m.id,
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
            <div className="bg-gradient-to-t from-[var(--warm-white)] via-[var(--warm-white)] to-transparent p-6">
              <ChatInput 
                onSend={sendMessage} 
                isLoading={isStreaming} 
              />
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar: Knowledge Base / Context Selector */}
      <div className="hidden w-72 flex-col overflow-hidden rounded-[2.5rem] border border-[rgba(194,91,58,0.16)] bg-[linear-gradient(180deg,#fff6ed_0%,#f7e6d7_100%)] p-6 text-[var(--ink)] shadow-2xl shadow-[rgba(194,91,58,0.12)] transition-all xl:flex">
        <h4 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--ink-muted)]">
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
                  ? "border-[var(--rust)] bg-[var(--rust)] shadow-lg shadow-[rgba(194,91,58,0.18)]"
                  : "border-[rgba(26,24,20,0.08)] bg-[rgba(255,255,255,0.72)] hover:bg-white"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <p className={cn(
                  "text-xs font-bold truncate pr-6",
                  selectedDocIds.includes(doc.id) ? "text-white" : "text-[var(--ink)]"
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
                <span className="text-[10px] font-black uppercase text-[var(--ink-faint)]">
                  {doc.size}
                </span>
                <span className={cn(
                  "text-[9px] font-bold uppercase",
                  selectedDocIds.includes(doc.id) ? "text-[#ffe1d4]" : "text-[var(--ink-muted)]"
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
