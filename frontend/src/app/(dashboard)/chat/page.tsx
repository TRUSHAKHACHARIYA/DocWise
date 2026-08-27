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
  Trash2,
  Sparkles,
  ShieldCheck,
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
import CitationPanel from "@/components/chat/CitationPanel";
import PDFViewer from "@/components/chat/PDFViewer";
import { Source } from "@/components/chat/SourceCard";
import { SUGGESTED_PROMPTS } from "@/lib/onboarding";

export default function ChatPage() {
  const { user } = useAuth();
  const [panelSources, setPanelSources] = useState<Source[]>([]);
  const [activeCitation, setActiveCitation] = useState<Source | null>(null);
  const [isCitationPanelOpen, setIsCitationPanelOpen] = useState(true);
  const [isMobileCitationOpen, setIsMobileCitationOpen] = useState(false);
  const { 
    sessions, 
    activeSessionId, 
    setActiveSessionId, 
    messages, 
    isLoading, 
    isStreaming,
    fetchSessions, 
    fetchSessionMessages,
    sendMessage,
    createSession,
    deleteSession,
    renameSession,
    updateSessionDocuments,
    updateSessionSettings,
  } = useChat();

  const { documents, loadDocuments, loadSampleDocuments } = useDocuments();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
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
    if (!activeSessionId) {
      setSelectedDocIds([]);
      return;
    }

    fetchSessionMessages(activeSessionId).then((session) => {
      if (session?.documents) {
        setSelectedDocIds(session.documents.map((link: { documentId: string }) => link.documentId));
      }
    });
  }, [activeSessionId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const sourceOnly = activeSession?.sourceOnly ?? false;

  const handleToggleSourceOnly = async () => {
    if (!activeSessionId) return;
    await updateSessionSettings(activeSessionId, { sourceOnly: !sourceOnly });
  };

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

  const handleSourceClick = (source: Source, sources: Source[]) => {
    setPanelSources(sources);
    setActiveCitation(source);
    setIsCitationPanelOpen(true);
    setIsMobileCitationOpen(true);
  };

  const handleTrySamples = async () => {
    setIsLoadingSamples(true);
    try {
      const uploadedIds = await loadSampleDocuments();
      setSelectedDocIds(uploadedIds);
      await createSession("Sample library Q&A", uploadedIds);
    } catch {
      // Toast handled in loadSampleDocuments
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const hasReadySelectedDocs = selectedDocIds.some((id) => {
    const doc = documents.find((d) => d.id === id);
    return doc?.status === "READY";
  });

  const hasProcessingSelectedDocs = selectedDocIds.some((id) => {
    const doc = documents.find((d) => d.id === id);
    return doc?.status === "PROCESSING";
  });

  const showSuggestedPrompts =
    Boolean(activeSessionId) &&
    messages.length === 0 &&
    hasReadySelectedDocs &&
    !isStreaming;

  return (
    <div className="relative flex h-[calc(100vh-120px)] gap-4 lg:gap-6">
      {/* Mobile citation overlay */}
      {isMobileCitationOpen && activeCitation?.documentId && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <PDFViewer
            documentId={activeCitation.documentId}
            documentName={activeCitation.title}
            initialPage={activeCitation.page}
            initialSearch={activeCitation.excerpt}
            onClose={() => setIsMobileCitationOpen(false)}
          />
        </div>
      )}

      {/* Sidebar: Sessions + document context */}
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
            <div className="mt-10 p-8 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
              No chats yet
            </div>
          )}
        </div>

        <div className="border-t border-[rgba(26,24,20,0.08)] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--ink-muted)]">
            <FileText size={14} />
            Active documents
          </h4>
          <div className="custom-scrollbar max-h-48 space-y-2 overflow-y-auto pr-1">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => toggleDocSelection(doc.id)}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-all",
                  selectedDocIds.includes(doc.id)
                    ? "border-[var(--rust)] bg-[var(--rust)] shadow-md shadow-[rgba(194,91,58,0.18)]"
                    : "border-[rgba(26,24,20,0.08)] bg-[var(--cream)] hover:bg-white"
                )}
              >
                <p
                  className={cn(
                    "truncate pr-4 text-xs font-bold",
                    selectedDocIds.includes(doc.id) ? "text-white" : "text-[var(--ink)]"
                  )}
                >
                  {doc.name}
                </p>
                <span className="text-[9px] font-bold uppercase text-[var(--ink-faint)]">{doc.size}</span>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="space-y-3 px-1 py-2">
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">
                  Upload documents first
                </p>
                <Button
                  size="sm"
                  onClick={handleTrySamples}
                  disabled={isLoadingSamples}
                  className="w-full gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  <Sparkles size={14} />
                  {isLoadingSamples ? "Loading samples..." : "Try sample docs"}
                </Button>
              </div>
            )}
          </div>
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
            <p className="mb-8 max-w-sm text-[10px] font-medium uppercase leading-relaxed tracking-widest text-[var(--ink-muted)]">
              Start a new conversation or load sample MSA and policy documents to get a cited answer in under a minute.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={handleNewSession} size="lg" className="rounded-2xl shadow-xl shadow-[rgba(194,91,58,0.16)]">
                New Conversation
              </Button>
              {documents.length === 0 && (
                <Button
                  onClick={handleTrySamples}
                  disabled={isLoadingSamples}
                  variant="outline"
                  size="lg"
                  className="gap-2 rounded-2xl"
                >
                  <Sparkles size={18} />
                  {isLoadingSamples ? "Loading samples..." : "Try sample documents"}
                </Button>
              )}
            </div>
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
                  variant={sourceOnly ? "primary" : "outline"}
                  size="sm"
                  onClick={handleToggleSourceOnly}
                  className="gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  title="Only answer from selected document passages"
                >
                  <ShieldCheck size={14} />
                  {sourceOnly ? "Source only" : "Source only: off"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCitationPanelOpen((open) => !open)}
                  className="hidden gap-2 rounded-xl border-[rgba(26,24,20,0.10)] text-[10px] font-black uppercase tracking-widest lg:inline-flex"
                >
                  {isCitationPanelOpen ? "Hide sources" : "Show sources"}
                </Button>
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
              {messages.length === 0 && hasProcessingSelectedDocs && (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Documents are still processing. Suggested prompts will appear when ingestion completes.
                </div>
              )}
              {messages.map((m) => (
                <MessageBubble 
                  key={m.id} 
                  message={{
                    id: m.id,
                    role: m.role === 'USER' ? 'user' : 'ai',
                    content: m.content,
                    sources: m.sources as Source[] | undefined,
                    isStreaming: isStreaming && m.id === messages[messages.length - 1].id && m.role === 'ASSISTANT'
                  }} 
                  activeSource={activeCitation}
                  onSourceClick={handleSourceClick}
                />
              ))}
            </div>

            {/* Chat Input */}
            <div className="bg-gradient-to-t from-[var(--warm-white)] via-[var(--warm-white)] to-transparent p-6">
              <ChatInput 
                onSend={sendMessage} 
                isLoading={isStreaming}
                suggestedPrompts={showSuggestedPrompts ? SUGGESTED_PROMPTS : undefined}
              />
            </div>
          </>
        )}
      </div>

      {/* Right panel: Citations + source preview (desktop) */}
      {isCitationPanelOpen && (
        <div className="hidden w-96 min-w-[22rem] lg:flex">
          <CitationPanel
            className="w-full"
            sources={panelSources}
            activeSource={activeCitation}
            onSourceSelect={(source) => {
              setActiveCitation(source);
              setIsMobileCitationOpen(false);
            }}
            onClear={() => setActiveCitation(null)}
          />
        </div>
      )}
    </div>
  );
}
