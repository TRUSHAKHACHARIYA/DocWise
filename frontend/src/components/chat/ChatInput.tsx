"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none p-2 pr-4 transition-all focus-within:ring-2 focus-within:ring-brand-500/10 focus-within:border-brand-500/30">
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <button className="p-3 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-2xl transition-all h-[48px]">
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your documents..."
          className="flex-1 bg-transparent border-none outline-none text-sm py-3 px-2 resize-none max-h-[200px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed"
          disabled={isLoading}
        />

        {/* Quick Suggestion Button (Optional AI Magic) */}
        {!text && (
          <button className="p-3 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-2xl transition-all h-[48px]">
            <Sparkles size={20} />
          </button>
        )}

        {/* Send Button */}
        <button 
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className={cn(
            "p-3 rounded-2xl transition-all flex items-center justify-center h-[48px] w-[48px]",
            text.trim() && !isLoading
              ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95" 
              : "bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 pointer-events-none"
          )}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
