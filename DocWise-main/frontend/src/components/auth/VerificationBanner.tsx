"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function VerificationBanner() {
  const { user, resendVerification, isLoading } = useAuthStore();
  const [sent, setSent] = useState(false);

  // If user is not loaded or already verified, don't show the banner
  if (!user || !!user.verifiedAt) {
    return null;
  }

  const handleResend = async () => {
    try {
      await resendVerification(user.email);
      setSent(true);
    } catch (error) {
      // Error handled by toast in store
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-8 py-2.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-amber-800">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertCircle size={18} className="text-amber-600" />
          </div>
          <div className="text-sm">
            <span className="font-bold">Verify your email address.</span>{" "}
            <span className="opacity-90">Please check your inbox at </span>
            <span className="font-semibold">{user.email}</span>
            <span className="opacity-90"> to unlock all features.</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-amber-800 hover:bg-amber-100 font-bold"
            onClick={handleResend}
            disabled={isLoading || sent}
          >
            {sent ? "Email Sent!" : "Resend Link"}
          </Button>
          <div className="h-4 w-px bg-amber-200" />
          <button className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-700 transition-colors flex items-center gap-1">
            Support <ArrowRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
