import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth";
import { auth } from "@/lib/auth";
import { toast } from "./toastStore";
import api from "@/lib/api";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password?: string) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/api/auth/login", { email, password });
          const { user, tokens } = res.data;
          
          auth.setTokens(tokens.accessToken, tokens.refreshToken);
          set({ user, isAuthenticated: true });
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
          const res = await api.post("/api/auth/register", { name, email, password });
          const { user, tokens } = res.data;
          
          auth.setTokens(tokens.accessToken, tokens.refreshToken);
          set({ user, isAuthenticated: true });
          toast.success("Account created!", "Welcome to DocWise.");
        } catch (error: any) {
          toast.error("Registration failed", error.response?.data?.error || "An error occurred");
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        auth.clearTokens();
        set({ user: null, isAuthenticated: false });
        toast.info("Logged out", "You have been signed out.");
      },

      setUser: (user: User) => set({ user, isAuthenticated: true }),
    }),
    {
      name: "docwise-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
