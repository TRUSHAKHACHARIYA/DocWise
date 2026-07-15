"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Lock, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/store/toastStore";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Error", "Passwords do not match.");
      return;
    }

    if (!token) {
      toast.error("Error", "Missing reset token.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      toast.success("Success", "Password has been reset successfully.");
    } catch (error) {
      toast.error("Error", "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="relative w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-100 ring-4 ring-white">
              <CheckCircle2 size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Access Restored</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[280px]">
            Your password has been successfully updated. Secure access is now available.
          </p>
        </div>
        <Button onClick={() => router.push("/login")} className="w-full" size="lg">
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">New Security</h1>
        <p className="text-slate-500 text-sm font-medium max-w-[280px] mx-auto">Create a strong password to protect your workspace intelligence.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={18} />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Revoke & Update
        </Button>
      </form>

      <div className="mt-10 text-center">
        <Link 
          href="/login" 
          className="inline-flex items-center text-xs font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft size={14} className="mr-2" />
          Cancel
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
       <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
       </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
