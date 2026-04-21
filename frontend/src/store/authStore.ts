import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth";
import { auth } from "@/lib/auth";
import { toast } from "./toastStore";
import api from "@/lib/api";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password?: string) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/login", { email, password });
          const { user, accessToken } = res.data;
          
          set({ user, accessToken, isAuthenticated: true });
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
          const { user, accessToken } = res.data;
          
          set({ user, accessToken, isAuthenticated: true });
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
        set({ user: null, accessToken: null, isAuthenticated: false });
        toast.info("Logged out", "You have been signed out.");
      },

      setUser: (user: User) => set({ user, isAuthenticated: true }),
      setAccessToken: (accessToken: string | null) => set({ accessToken }),
      updateUser: (updates) => set((state) => ({ 
        user: state.user ? { ...state.user, ...updates } : null 
      })),
    }),
    {
      name: "docwise-auth",
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }), // Don't persist user PII
    }
  )
);
