import Link from "next/link"
import { FileText, Zap, Shield, BarChart3, ArrowRight, Check } from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"

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
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">DocWise</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center animate-fade-in">
        <Badge variant="purple" className="mb-6">Now in beta — free to start</Badge>
        <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
          Chat with your documents.<br />
          <span className="text-brand-600">Get answers instantly.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload any PDF or document. Ask questions in plain English.
          DocWise retrieves the exact answer — with citations — in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register">
            <Button size="lg" icon={<ArrowRight size={18} />}>
              Start for free
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="secondary" size="lg">See how it works</Button>
          </Link>
        </div>

        {/* Hero image placeholder */}
        <div className="mt-16 rounded-2xl border border-slate-200 bg-surface-secondary shadow-card overflow-hidden">
          <div className="h-80 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-sm">App screenshot goes here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-surface-secondary py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need</h2>
            <p className="text-slate-500 text-lg">Built for teams that live in documents.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-6 animate-slide-up">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple pricing</h2>
            <p className="text-slate-500 text-lg">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`card p-8 ${plan.highlight ? "ring-2 ring-brand-600 shadow-card-hover" : ""}`}>
                {plan.highlight && (
                  <Badge variant="purple" className="mb-4">Most popular</Badge>
                )}
                <h3 className="font-bold text-slate-900 text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                </div>
                <p className="text-sm text-slate-500 mb-6">{plan.period}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check size={14} className="text-brand-600 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button variant={plan.highlight ? "primary" : "secondary"} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
              <FileText size={12} className="text-white" />
            </div>
            <span>DocWise © 2025</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}