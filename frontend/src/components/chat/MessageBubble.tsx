"use client";

import { Sparkles, User, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import SourceCard, { Source } from "./SourceCard";
import { useChat } from "@/hooks/useChat";

interface Message {
  id: string;
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
  const { submitMessageFeedback } = useChat();
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);

  const handleFeedback = (isPositive: boolean) => {
    if (rating) return;
    setRating(isPositive ? 'positive' : 'negative');
    submitMessageFeedback(message.id, isPositive);
  };

  return (
    <div className={cn(
      "flex w-full gap-4 mb-8 transition-all animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
        isUser
          ? "bg-slate-900 dark:bg-slate-700 text-white"
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
          "px-5 py-4 rounded-3xl text-sm leading-relaxed transition-colors",
          isUser
            ? "bg-brand-600 text-white rounded-tr-none shadow-lg shadow-brand-500/10"
            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-none shadow-sm"
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
              <button 
                onClick={() => navigator.clipboard.writeText(message.content)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </button>
              <button 
                onClick={() => handleFeedback(true)}
                disabled={rating !== null}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  rating === 'positive' 
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                    : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                )}
              >
                <ThumbsUp size={16} fill={rating === 'positive' ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={() => handleFeedback(false)}
                disabled={rating !== null}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  rating === 'negative' 
                    ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400" 
                    : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                )}
              >
                <ThumbsDown size={16} fill={rating === 'negative' ? "currentColor" : "none"} />
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
