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
  const isReady = text.trim() && !isLoading;

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
    <div className="relative rounded-3xl border border-[rgba(194,91,58,0.14)] bg-[linear-gradient(180deg,#fffaf3_0%,#f8ecdf_100%)] p-2 pr-4 shadow-[0_18px_40px_-24px_rgba(120,72,36,0.25)] transition-all focus-within:border-[rgba(194,91,58,0.28)] focus-within:ring-2 focus-within:ring-brand-500/10">
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <button className="h-[48px] rounded-2xl p-3 text-[var(--ink-faint)] transition-all hover:bg-[rgba(194,91,58,0.10)] hover:text-[var(--rust-dark)]">
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your documents..."
          className="max-h-[200px] flex-1 resize-none border-none bg-transparent px-2 py-3 text-sm leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
          disabled={isLoading}
        />

        {/* Quick Suggestion Button (Optional AI Magic) */}
        {!text && (
          <button className="h-[48px] rounded-2xl p-3 text-[var(--ink-faint)] transition-all hover:bg-[rgba(194,91,58,0.08)] hover:text-[var(--rust-dark)]">
            <Sparkles size={20} />
          </button>
        )}

        {/* Send Button */}
        <button 
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className={cn(
            "flex h-[48px] w-[48px] items-center justify-center rounded-2xl p-3 transition-all",
            isReady
              ? "bg-[var(--rust)] text-white shadow-lg shadow-[rgba(194,91,58,0.20)] hover:scale-105 hover:bg-[var(--rust-dark)] active:scale-95"
              : "pointer-events-none bg-[rgba(255,255,255,0.72)] text-[var(--ink-faint)] border border-[rgba(26,24,20,0.08)]"
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
