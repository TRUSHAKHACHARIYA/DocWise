"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated, but save the current path to return later
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (requireAdmin && user?.role !== "ADMIN") {
        // Redirect to dashboard if trying to access admin page without being an admin
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, requireAdmin, router, pathname, isMounted]);

  // Show loading state while checking authentication
  if (!isMounted || isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--cream)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-[var(--ink-muted)]">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Authorize user
  if (requireAdmin && user?.role !== "ADMIN") {
    return null; // Will be handled by the router.push above
  }

  return <>{children}</>;
}
