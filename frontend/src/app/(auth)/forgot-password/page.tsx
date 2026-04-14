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
      <div className="w-full text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Check your email</h1>
          <p className="text-slate-500 text-sm">
            We've sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>.
          </p>
        </div>
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Reset Password</h1>
        <p className="text-slate-500 text-sm">Enter your email to receive a password reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Send Reset Link
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
