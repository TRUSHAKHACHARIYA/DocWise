"use client";

import { Sparkles, User, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import SourceCard, { Source } from "./SourceCard";

interface Message {
  role: "user" | "ai";
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onSourceClick?: (source: Source) => void;
}

export default function MessageBubble({ message, onSourceClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn(
      "flex w-full gap-4 mb-8 transition-all animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
        isUser 
          ? "bg-slate-900 text-white" 
          : "bg-gradient-to-br from-brand-600 to-indigo-500 text-white"
      )}>
        {isUser ? <User size={20} /> : <Sparkles size={20} />}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-5 py-4 rounded-3xl text-sm leading-relaxed",
          isUser 
            ? "bg-brand-600 text-white rounded-tr-none shadow-lg shadow-brand-500/10" 
            : "bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-sm"
        )}>
          {message.content}
          {message.isStreaming && (
            <span className="streaming-cursor ml-1" />
          )}
        </div>

        {/* Sources & Actions (only for AI) */}
        {!isUser && !message.isStreaming && (
          <div className="mt-4 w-full space-y-4">
            {/* Feedback / Copy Actions */}
            <div className="flex items-center gap-3 ml-2">
              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Copy size={16} />
              </button>
              <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                <ThumbsUp size={16} />
              </button>
              <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <ThumbsDown size={16} />
              </button>
            </div>

            {/* Citations / Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {message.sources.map((source, idx) => (
                  <SourceCard 
                    key={idx} 
                    source={source} 
                    onOpen={onSourceClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp / Meta for User */}
        {isUser && (
          <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase mr-1">
            Delivered
          </span>
        )}
      </div>
    </div>
  );
}
