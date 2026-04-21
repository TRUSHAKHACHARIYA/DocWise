"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Mail, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/store/toastStore";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSubmitted(true);
      toast.success("Check your email", "We sent a reset link if an account exists.");
    } catch (error) {
      toast.error("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-brand-200 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="relative w-20 h-20 bg-brand-50 rounded-[2rem] flex items-center justify-center text-brand-600 shadow-xl shadow-brand-100 ring-4 ring-white">
              <Mail className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Check Inbox</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[280px]">
            We've sent a password reset link to <span className="font-bold text-slate-900">{email}</span>.
          </p>
        </div>
        <div className="space-y-6">
          <Link 
            href="/login" 
            className="inline-flex items-center text-xs font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft size={14} className="mr-2" />
            Back to login
          </Link>
          <div className="pt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Didn't get the email? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Forgot Password?</h1>
        <p className="text-slate-500 text-sm font-medium max-w-[280px] mx-auto">Enter your email and we'll send you instructions to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email address"
          type="email"
          placeholder="name@company.com"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Request Reset Link
        </Button>
      </form>

      <p className="mt-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
        Remember your password?{" "}
        <Link href="/login" className="text-brand-600 hover:text-brand-700 decoration-2 underline-offset-4 hover:underline transition-all">
          Sign in
        </Link>
      </p>
    </div>
  );
}
