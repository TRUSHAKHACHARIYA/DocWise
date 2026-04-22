import { ReactNode } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import VerificationBanner from "@/components/auth/VerificationBanner";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FeedbackWidget from "@/components/dashboard/FeedbackWidget";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <VerificationBanner />
          <DashboardHeader />
          
          <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
            {children}
          </main>
        </div>

        <FeedbackWidget />
      </div>
    </AuthGuard>
  );
}
