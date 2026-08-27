"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Attempts to resume a session from the httpOnly refresh cookie once, on
 * app boot, before any route decides whether to redirect to /login.
 */
export default function AuthInitializer() {
  const initSession = useAuthStore((state) => state.initSession);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    initSession();
  }, [initSession]);

  return null;
}
