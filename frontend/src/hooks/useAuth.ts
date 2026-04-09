import { create } from 'zustand';
import { toast } from '@/store/toastStore';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  register: (name: string, email: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user
    const mockUser = {
      id: 'usr_123',
      name: email.split('@')[0],
      email: email
    };
    
    set({ user: mockUser, isAuthenticated: true });
    toast.success("Welcome back!", "You have successfully logged in.");
  },

  register: async (name, email) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    set({ 
      user: { id: 'usr_456', name, email },
      isAuthenticated: true 
    });
    toast.success("Account created!", "Your account has been set up successfully.");
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
    toast.info("Logged out", "You have been logged out.");
  }
}));
