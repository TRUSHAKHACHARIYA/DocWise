"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/store/toastStore";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.includes("@")) newErrors.email = "Please enter a valid email address.";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (error) {
      toast.error("Login failed", "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Welcome Back!</h1>
        <p className="text-slate-500 text-sm">Sign in to unlock your documents.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          <div className="flex justify-end mt-1.5">
            <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
