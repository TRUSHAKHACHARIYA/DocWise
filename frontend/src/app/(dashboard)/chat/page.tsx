"use client";

import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  MoreVertical, 
  Settings2,
  Trash2,
  Sparkles,
  Info
} from "lucide-react";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import { cn } from "@/lib/utils";

const MOCK_SESSIONS = [
  { id: "1", title: "Financial Report Analysis", lastMsg: "The EBITDA margin increased by 2.4%...", time: "2h ago" },
  { id: "2", title: "Legal Contract Review", lastMsg: "The liability clause is standard.", time: "Yesterday" },
  { id: "3", title: "Study Notes on GPT-4", lastMsg: "Explain the attention mechanism.", time: "3d ago" },
];

const INITIAL_MESSAGES = [
  { 
    role: "ai" as const, 
    content: "Hi! I'm your DocWise assistant. I've indexed your documents and I'm ready to answer any questions. What would you like to know today?",
  },
];

interface Message {
  role: "ai" | "user";
  content: string;
  sources?: any[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [activeSession, setActiveSession] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMsg = { role: "user" as const, content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        role: "ai" as const, 
        content: `I've analyzed your documents, and according to the 2023 Financial Report, the EBITDA growth was driven by optimization in operational costs.`,
        sources: [
          { title: "Financial Report 2023.pdf", excerpt: "EBITDA growth of 2.4% attributed to cost reduction...", page: 12 },
          { title: "Operational Audit.docx", excerpt: "Efficiency improvements in supply chain...", page: 4 }
        ]
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-64px-64px)] -m-8 relative overflow-hidden bg-white">
      {/* Sessions Sidebar */}
      <aside className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-6">
          <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 shadow-sm hover:border-brand-300 hover:text-brand-600 transition-all group active:scale-[0.98]">
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
                activeSession === session.id 
                  ? "bg-white shadow-md border border-slate-100" 
                  : "hover:bg-white hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className={cn(
                  "font-bold text-sm truncate pr-4",
                  activeSession === session.id ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
                )}>
                  {session.title}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 shrink-0">{session.time}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 font-medium">{session.lastMsg}</p>
              
              {activeSession === session.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-r-full" />
              )}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-brand-50 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
              <Info size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-800 mb-0.5">Pro Tip</p>
              <p className="text-[10px] font-medium text-brand-600 leading-relaxed">
                Mention specific documents using @ symbol to focus the AI's search.
              </p>
            </div>
          </div>
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
                {sessions.find(s => s.id === activeSession)?.title || "Chat Session"}
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Model: Claude 3.5 Sonnet</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <Settings2 size={20} />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-8 pb-10 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            <p className="text-center text-[10px] text-slate-400 font-medium mt-3">
              DocWise can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
