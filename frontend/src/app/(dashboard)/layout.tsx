import AuthGuard from "@/components/auth/AuthGuard";
import VerificationBanner from "@/components/auth/VerificationBanner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <VerificationBanner />
          <DashboardHeader />
          
          <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
