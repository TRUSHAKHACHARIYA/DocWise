import { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-50 overflow-hidden">
      
      {/* 3D Animated Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #4f46e5 1px, transparent 1px),
            linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 60%, transparent 100%)',
        }}
      />

      {/* Floating Bright Gradient Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-brand-400 to-cyan-300 blur-[80px] opacity-30 mix-blend-multiply animate-pulse-soft -translate-x-[20%] -translate-y-[20%]" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-purple-400 to-pink-300 blur-[80px] opacity-30 mix-blend-multiply animate-pulse-soft translate-x-[30%] translate-y-[30%]" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 w-full max-w-[460px] px-6 py-12">
        <div className="flex justify-center mb-10 animate-slide-up">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center group-hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-500 blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-12 h-12 bg-white rounded-2xl border border-white/50 flex items-center justify-center shadow-lg">
                <Sparkles size={24} className="text-brand-600" />
              </div>
            </div>
            <span className="font-black text-slate-900 text-3xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">DocWise</span>
          </Link>
        </div>

        {/* Ultra-Premium Glass Form Container */}
        <div className="relative group animate-slide-up" style={{ animationDelay: '100ms' }}>
          {/* Animated glow border effect */}
          <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-b from-brand-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-700" />
          
          <div className="relative bg-white/70 backdrop-blur-3xl border border-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] p-8 sm:p-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            {children}
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-sm mt-10 animate-slide-up font-medium" style={{ animationDelay: '200ms' }}>
          Secure, AI-powered document intelligence.
        </p>
      </div>
    </div>
  );
}
