import Link from "next/link"
import { FileText, Zap, Shield, BarChart3, ArrowRight, Check } from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import HeroVisual from "@/components/dashboard/HeroVisual"
import { cn } from "@/lib/utils"

const features = [
  { icon: FileText, title: "Any document type", desc: "PDF, DOCX, TXT — drag, drop, done." },
  { icon: Zap, title: "Instant answers", desc: "Streaming responses with source citations." },
  { icon: Shield, title: "Private & secure", desc: "Your documents never leave your namespace." },
  { icon: BarChart3, title: "Usage analytics", desc: "Track queries, docs, and team activity." },
]

const plans = [
  { name: "Free", price: "$0", period: "forever", features: ["3 documents", "50 questions/mo", "Basic chat"], cta: "Get started", highlight: false },
  { name: "Starter", price: "$19", period: "per month", features: ["20 documents", "500 questions/mo", "Export chats"], cta: "Start free trial", highlight: true },
  { name: "Pro", price: "$49", period: "per month", features: ["Unlimited docs", "5,000 questions/mo", "API access"], cta: "Go Pro", highlight: false },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500">

      {/* Nav */}
      <nav className="border-b border-slate-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">DocWise</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-bold">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="shadow-lg shadow-brand-500/10 font-bold">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center animate-fade-in">
        <Badge variant="purple" className="mb-6 uppercase tracking-widest font-black text-[10px]">Now in beta — free to start</Badge>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tighter">
          Chat with your documents.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-500">Get answers instantly.</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
          Upload any PDF or document. Ask questions in plain English.
          DocWise retrieves the exact answer — with citations — in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 rounded-2xl shadow-2xl shadow-brand-500/20 text-base font-bold" icon={<ArrowRight size={18} />}>
              Start for free
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="secondary" size="lg" className="h-14 px-8 rounded-2xl text-base font-bold dark:bg-zinc-900 dark:border-zinc-800 dark:text-white">See how it works</Button>
          </Link>
        </div>

        {/* Premium Hero Visual */}
        <div className="mt-16 relative">
           <HeroVisual />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 dark:bg-zinc-900/50 py-32 border-y border-slate-100 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge variant="purple" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Everything you need</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-lg font-medium">Built for researchers, teams, and professionals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={f.title} className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all group animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon size={24} className="text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge variant="purple" className="mb-4">Pricing</Badge>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Simple, transparent plans</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-lg font-medium">Start for free and scale as you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div key={plan.name} className={cn(
                "p-10 rounded-[2.5rem] border transition-all animate-slide-up relative flex flex-col",
                plan.highlight 
                  ? "bg-slate-900 dark:bg-zinc-900 border-slate-800 dark:border-zinc-700 shadow-2xl scale-105 z-10" 
                  : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-brand-500/20"
              )} style={{ animationDelay: `${i * 100}ms` }}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="purple" className="shadow-lg">Most popular</Badge>
                  </div>
                )}
                <h3 className={cn("font-bold text-lg mb-2", plan.highlight ? "text-white" : "text-slate-900 dark:text-white")}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={cn("text-5xl font-black", plan.highlight ? "text-white" : "text-slate-900 dark:text-white")}>{plan.price}</span>
                </div>
                <p className={cn("text-xs font-bold uppercase tracking-widest mb-10", plan.highlight ? "text-slate-400" : "text-slate-500")}>{plan.period}</p>
                <ul className="space-y-4 mb-12 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={cn("flex items-center gap-3 text-sm font-bold", plan.highlight ? "text-slate-300" : "text-slate-600 dark:text-zinc-400")}>
                      <Check size={16} className="text-brand-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button 
                    variant={plan.highlight ? "primary" : "secondary"} 
                    className={cn(
                      "w-full h-12 rounded-xl font-bold transition-all",
                      plan.highlight ? "bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20" : "dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-zinc-900 py-16 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <FileText size={20} className="text-white" />
                </div>
                <span className="font-black text-slate-900 dark:text-white text-xl tracking-tighter">DocWise</span>
              </div>
              <p className="text-slate-500 dark:text-zinc-500 text-sm font-medium max-w-xs text-center md:text-left">
                Empowering researchers and professionals with intelligent document analysis.
              </p>
            </div>
            
            <div className="flex gap-12">
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Product</h4>
                <a href="#" className="text-sm font-bold text-slate-600 dark:text-zinc-400 hover:text-brand-600 transition-colors">Features</a>
                <a href="#" className="text-sm font-bold text-slate-600 dark:text-zinc-400 hover:text-brand-600 transition-colors">Pricing</a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Legal</h4>
                <a href="#" className="text-sm font-bold text-slate-600 dark:text-zinc-400 hover:text-brand-600 transition-colors">Privacy</a>
                <a href="#" className="text-sm font-bold text-slate-600 dark:text-zinc-400 hover:text-brand-600 transition-colors">Terms</a>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-100 dark:border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              DocWise © 2026 — Built with ❤️ for Knowledge
            </span>
            <div className="flex gap-6">
               {/* Social links placeholder */}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}