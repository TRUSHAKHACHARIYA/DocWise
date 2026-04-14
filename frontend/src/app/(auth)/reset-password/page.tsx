"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
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
      await api.post("/api/auth/reset-password", { token, password });
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
      <div className="w-full text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Password Reset!</h1>
          <p className="text-slate-500 text-sm">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>
        <Button onClick={() => router.push("/login")} className="w-full" size="lg">
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">New Password</h1>
        <p className="text-slate-500 text-sm">Please enter a new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          Update Password
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Cancel and return to login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
