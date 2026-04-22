"use client";

import { useState } from "react";
import { MessageSquarePlus, X, Send, Loader2, Sparkles, AlertCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import { toast } from "@/store/toastStore";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"BUG" | "FEATURE" | "PRAISE">("PRAISE");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length < 5) return;

    setIsSubmitting(true);
    try {
      await api.post("/feedback", { content, type });
      toast.success("Thank You!", "Your feedback has been sent to our team.");
      setContent("");
      setIsOpen(false);
    } catch (err) {
      toast.error("Error", "Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {/* Feedback Panel */}
      <div className={cn(
        "w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl transition-all duration-500 overflow-hidden",
        isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95 pointer-events-none"
      )}>
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquarePlus size={20} className="text-brand-400" />
            <h4 className="text-sm font-black uppercase tracking-widest">Feedback</h4>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-2">
            {(['BUG', 'FEATURE', 'PRAISE'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 py-2 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all flex flex-col items-center gap-1",
                  type === t 
                    ? "bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/20" 
                    : "bg-slate-50 dark:bg-zinc-800 border-slate-100 dark:border-zinc-700 text-slate-400"
                )}
              >
                {t === 'BUG' && <AlertCircle size={14} />}
                {t === 'FEATURE' && <Sparkles size={14} />}
                {t === 'PRAISE' && <Heart size={14} />}
                {t}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === 'BUG' ? "What went wrong?" : 
              type === 'FEATURE' ? "What should we build next?" : 
              "Share your thought..."
            }
            className="w-full h-32 p-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none text-slate-900 dark:text-white"
            required
          />

          <Button 
            type="submit" 
            disabled={isSubmitting || content.length < 5}
            className="w-full gap-2 rounded-2xl shadow-xl shadow-brand-100 dark:shadow-none"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Send Feedback
          </Button>
        </form>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 group",
          isOpen 
            ? "bg-slate-900 text-white rotate-90" 
            : "bg-brand-600 text-white hover:bg-brand-700 -rotate-0"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquarePlus size={24} />}
        
        {/* Tooltip (only when closed) */}
        {!isOpen && (
          <div className="absolute right-full mr-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">
            Help & Feedback
          </div>
        )}
      </button>
    </div>
  );
}
