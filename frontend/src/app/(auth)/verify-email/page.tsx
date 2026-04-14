"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

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
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        })
        .catch(() => {
          setStatus("error");
        });
    } else {
      setStatus("error");
    }
  }, [token, verifyEmail, router]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      {status === "loading" && (
        <>
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          <div>
            <h1 className="text-2xl font-bold text-white">Verifying your email</h1>
            <p className="text-zinc-400 mt-2">Please wait while we confirm your account...</p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
            <p className="text-zinc-400 mt-2">Your account has been successfully verified. Redirecting you to the dashboard...</p>
          </div>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-16 w-16 text-rose-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
            <p className="text-zinc-400 mt-2">The verification link is invalid or has expired.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild variant="outline">
              <Link href="/login">Back to Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Try Registering Again</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="max-w-md w-full mx-auto p-6">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          <h1 className="text-2xl font-bold text-white">Loading...</h1>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
