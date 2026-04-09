"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/store/toastStore";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    if (name.length < 2) newErrors.name = "Please enter your full name.";
    if (!email.includes("@")) newErrors.email = "Please enter a valid email address.";
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(name, email);
      router.push("/dashboard"); 
    } catch (error) {
      toast.error("Registration failed", "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Create Account</h1>
        <p className="text-slate-500 text-sm">Join DocWise and start chatting securely.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
         <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          icon={<User size={18} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

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
        
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="Must be at least 8 characters long."
          required
        />

        <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
