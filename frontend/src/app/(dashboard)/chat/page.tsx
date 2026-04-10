"use client";

import { useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Settings2,
  Trash2,
  Info,
  Files,
  Check
} from "lucide-react";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";

export default function ChatPage() {
  const { 
    sessions, 
    activeSessionId, 
    messages, 
    isStreaming, 
    fetchSessions,
    fetchSessionMessages,
    createSession,
    deleteSession,
    updateSessionDocuments,
    sendMessage,
    setActiveSession
  } = useChat();

  const { documents: availableDocs, loadDocuments } = useDocuments();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
    loadDocuments();
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  // Selected doc IDs from the active session (backend structure session.documents = [{documentId, document: {...}}, ...])
  const selectedDocIds = activeSession?.documents?.map((d: any) => d.documentId) || [];

  useEffect(() => {
    if (activeSessionId) {
      fetchSessionMessages(activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDocToggle = async (docId: string) => {
    if (!activeSessionId) return;
    
    let newSelectedIds: string[];
    if (selectedDocIds.includes(docId)) {
      newSelectedIds = selectedDocIds.filter((id: string) => id !== docId);
    } else {
      newSelectedIds = [...selectedDocIds, docId];
    }
    
    await updateSessionDocuments(activeSessionId, newSelectedIds);
    // Refresh session data to update UI
    fetchSessions();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewChat = () => {
    createSession();
  };

  return (
    <div className="flex h-[calc(100vh-64px-64px)] -m-8 relative overflow-hidden bg-white">
      {/* Sessions Sidebar */}
      <aside className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-6">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 shadow-sm hover:border-brand-300 hover:text-brand-600 transition-all group active:scale-[0.98]"
          >
            New Chat
            <Plus size={18} className="text-slate-400 group-hover:text-brand-600" />
          </button>
        </div>

        <div className="px-6 mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-white border-none rounded-xl text-xs focus:ring-1 focus:ring-slate-200 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-6">
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recent chats</p>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={cn(
                "w-full text-left p-4 rounded-2xl transition-all group relative",
                activeSessionId === session.id 
                  ? "bg-white shadow-md border border-slate-100" 
                  : "hover:bg-white hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className={cn(
                  "font-bold text-sm truncate pr-4",
                  activeSessionId === session.id ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
                )}>
                  {session.title}
                </h4>
              </div>
              <p className="text-[10px] font-bold text-slate-400 shrink-0">
                {new Date(session.updatedAt).toLocaleDateString()}
              </p>
              
              {activeSessionId === session.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-r-full" />
              )}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          {activeSessionId ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Knowledge Base</p>
                <Files size={12} className="text-slate-400" />
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {availableDocs.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleDocToggle(doc.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-all",
                        isSelected 
                          ? "bg-brand-50 text-brand-700 border border-brand-100" 
                          : "text-slate-500 hover:bg-white hover:shadow-sm border border-transparent"
                      )}
                    >
                      <span className="truncate pr-2">{doc.name}</span>
                      {isSelected && <Check size={14} className="shrink-0" />}
                    </button>
                  );
                })}
                {availableDocs.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic px-2">No documents available.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-brand-50 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                <Info size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-800 mb-0.5">Pro Tip</p>
                <p className="text-[10px] font-medium text-brand-600 leading-relaxed">
                  Upload more documents to expand your knowledge base.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-16 px-8 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                {sessions.find(s => s.id === activeSessionId)?.title || "Select a chat"}
              </h3>
              {activeSessionId && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Model: Claude 3.5 Sonnet</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <Settings2 size={20} />
            </button>
            <button 
              onClick={() => activeSessionId && deleteSession(activeSessionId)}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          <div className="max-w-4xl mx-auto">
            {!activeSessionId ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Start a new conversation</h3>
                <p className="text-slate-500 max-w-xs font-medium">Select a chat from the sidebar or create a new one to begin chatting with your documents.</p>
                <button 
                   onClick={handleNewChat}
                   className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all active:scale-95 text-sm"
                >
                  <Plus size={18} />
                  New Chat
                </button>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={{ ...msg, role: msg.role === "USER" ? "user" : "ai" }} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-8 pb-10 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={sendMessage} isLoading={isStreaming} disabled={!activeSessionId} />
            <p className="text-center text-[10px] text-slate-400 font-medium mt-3">
              DocWise can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
