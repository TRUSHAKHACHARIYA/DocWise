import { create } from "zustand";
import type { User } from "@/types/auth";
import { auth } from "@/lib/auth";
import { toast } from "./toastStore";
import api, { refreshAccessToken } from "@/lib/api";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string | null) => void;
  setCsrfToken: (token: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  /** Attempt to resume a session from the httpOnly refresh cookie on app boot. */
  initSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  csrfToken: null,
  isAuthenticated: false,
  // Starts true so AuthGuard waits for initSession() to resolve instead of
  // redirecting to /login before a valid refresh cookie gets a chance to
  // restore the session.
  isLoading: true,

  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, accessToken, csrfToken } = res.data;

      set({ user, accessToken, csrfToken, isAuthenticated: true });
      toast.success("Welcome back!", "You have successfully logged in.");
    } catch (error: any) {
      toast.error("Login failed", error.response?.data?.error || "Invalid credentials");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name: string, email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/register", { name, email, password });
      toast.success("Account created!", res.data.message || "Please check your email to verify your account.");
    } catch (error: any) {
      toast.error("Registration failed", error.response?.data?.error || "An error occurred");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyEmail: async (token: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/verify-email", { token });
      const { user, accessToken, csrfToken } = res.data;

      set({ user, accessToken, csrfToken, isAuthenticated: true });
      toast.success("Email verified!", "Your account is now ready to use.");
    } catch (error: any) {
      toast.error("Verification failed", error.response?.data?.error || "Invalid or expired token");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resendVerification: async (email: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/resend-verification", { email });
      toast.success("Email sent", res.data.message || "Verification email has been resent.");
    } catch (error: any) {
      toast.error("Failed to resend email", error.response?.data?.error || "An error occurred");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    api.post("/auth/logout").catch(() => {}); // Fire and forget logout
    set({ user: null, accessToken: null, csrfToken: null, isAuthenticated: false });
    toast.info("Logged out", "You have been signed out.");
  },

  setUser: (user: User) => set({ user, isAuthenticated: true }),
  setAccessToken: (accessToken: string | null) => set({ accessToken }),
  setCsrfToken: (csrfToken: string | null) => set({ csrfToken }),
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),

  initSession: async () => {
    try {
      const csrfRes = await api.get("/auth/csrf");
      set({ csrfToken: csrfRes.data.csrfToken });

      // Uses the httpOnly refresh_token cookie — succeeds only if the
      // browser still has a valid one from a prior login.
      await refreshAccessToken();

      const meRes = await api.get("/user/me");
      set({ user: meRes.data.user, isAuthenticated: true });
    } catch {
      // No valid session to resume — this is the normal, expected outcome
      // for a first-time or logged-out visitor, not an error to surface.
      set({ user: null, accessToken: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
