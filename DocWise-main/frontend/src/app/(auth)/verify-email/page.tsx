"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle, Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail, isLoading } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (token) {
      verifyEmail(token)
        .then(() => {
          setStatus("success");
          setTimeout(() => {
            router.push("/dashboard");
          }, 4000);
        })
        .catch(() => {
          setStatus("error");
        });
    } else {
      setStatus("error");
    }
  }, [token, verifyEmail, router]);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {status === "loading" && (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-brand-200 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="relative w-20 h-20 bg-brand-50 rounded-[2rem] flex items-center justify-center text-brand-600 shadow-xl shadow-brand-100 ring-4 ring-white">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Verifying Email</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest leading-relaxed max-w-[280px]">
            Please wait while we confirm your workspace credentials...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8 mx-auto w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-100 ring-4 ring-white">
            <CheckCircle2 className="h-10 w-10 animate-bounce-subtle" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Success!</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[280px] mb-8">
            Your email is verified. We're getting your workspace ready...
          </p>
          <div className="space-y-4">
             <Button onClick={() => router.push("/dashboard")} className="w-full" size="lg" icon={<ArrowRight size={18} />}>
                Go to Dashboard
             </Button>
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Redirecting in seconds...</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8 mx-auto w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100 ring-4 ring-white">
            <XCircle className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Failed</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[280px] mb-8">
            The link is invalid or has expired. Please try again or contact support.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push("/login")} variant="secondary" className="w-full">
              Back to Login
            </Button>
            <Link href="/register" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Try Registering Again
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="w-full py-4">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center text-center py-10">
          <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
