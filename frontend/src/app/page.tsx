import Link from "next/link";
import { ArrowRight, Check, FileText, Shield, Sparkles, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import HeroVisual from "@/components/dashboard/HeroVisual";

const features = [
  {
    icon: FileText,
    title: "Any document type",
    desc: "PDF, DOCX, TXT. Drag, drop, done.",
  },
  {
    icon: Zap,
    title: "Cited, instant answers",
    desc: "Streaming responses with exact source references.",
  },
  {
    icon: Shield,
    title: "Private by default",
    desc: "Your documents stay isolated in your workspace.",
  },
  {
    icon: Sparkles,
    title: "Multi-document queries",
    desc: "Ask across your library and synthesize answers.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["5 documents", "20 questions / month", "10MB max file size"],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$19",
    period: "per month",
    features: ["20 documents", "200 questions / month", "Email support"],
    cta: "Start Starter",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    features: ["Unlimited documents", "Unlimited questions", "Multi-doc queries", "API access"],
    cta: "Start Pro trial",
    highlight: true,
  },
];

const proofPoints = [
  "Citations on every answer",
  "Private workspace retrieval",
  "Built for analysts and researchers",
];

const trustedTeams = ["Meridian", "Northgate", "Arxis", "Lumina Health", "Crestview", "Meridian", "Northgate", "Arxis", "Lumina Health", "Crestview"];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--cream)] text-[var(--ink)]">
      <nav className="sticky top-0 z-50 border-b border-[rgba(26,24,20,0.08)] bg-[rgba(250,248,244,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ink)] text-[var(--cream)] shadow-md">
              <FileText size={18} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">DocWise</span>
          </Link>

          <div className="hidden gap-8 md:flex">
            <a href="#features" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">Features</a>
            <a href="#how-it-works" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">How it works</a>
            <a href="#pricing" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="shadow-lg shadow-brand-500/10">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-28">
          <div className="pointer-events-none absolute left-0 top-8 -z-10 h-56 w-56 rounded-full bg-[rgba(196,71,30,0.10)] blur-[90px] animate-drift" />
          <div className="pointer-events-none absolute right-12 top-24 -z-10 h-44 w-44 rounded-full bg-[rgba(74,103,65,0.10)] blur-[80px] animate-float-delayed" />

          <div>
            <Badge className="animation-delay-1 animate-reveal-up mb-6 bg-[var(--rust-light)] text-[10px] font-black uppercase tracking-[0.18em] text-[var(--rust-dark)]">
              Now in open beta
            </Badge>
            <h1 className="animate-reveal-up animation-delay-2 max-w-2xl font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
              Your documents,
              <br />
              <em className="italic text-brand-600">finally fluent.</em>
            </h1>
            <p className="animate-reveal-up animation-delay-3 mt-6 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">
              Upload any PDF or document. Ask questions in plain English. DocWise retrieves exact, cited answers in seconds.
            </p>
            <div className="animate-reveal-up animation-delay-4 mt-10 flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 rounded-2xl px-8 text-base font-bold" icon={<ArrowRight size={18} />}>
                  Start for free
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="h-14 rounded-2xl px-8 text-base font-bold">
                  See how it works
                </Button>
              </a>
            </div>
            <p className="animate-reveal-up animation-delay-5 mt-5 flex items-center gap-2 text-sm text-[var(--ink-faint)]">
              <span className="h-px w-6 bg-[var(--ink-faint)]" />
              No credit card required. Free plan always available.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {proofPoints.map((item, index) => (
                <div
                  key={item}
                  className={`animate-reveal-up rounded-[1.5rem] border border-[rgba(26,24,20,0.08)] bg-[rgba(255,253,249,0.7)] px-4 py-4 shadow-[0_18px_40px_-30px_rgba(26,24,20,0.28)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 ${index === 0 ? "animation-delay-3" : index === 1 ? "animation-delay-4" : "animation-delay-5"}`}
                >
                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--rust-dark)]">DocWise Signal</div>
                  <p className="text-sm font-semibold text-[var(--ink-muted)]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-reveal-up animation-delay-4">
            <HeroVisual />
          </div>
        </section>

        <section className="overflow-hidden border-y border-[rgba(26,24,20,0.08)] bg-[var(--warm-white)] px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 md:flex-row md:justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">Trusted by teams at</span>
            <div className="relative w-full overflow-hidden md:max-w-3xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--warm-white)] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--warm-white)] to-transparent" />
              <div className="animate-marquee flex w-max gap-6 text-sm font-semibold text-[var(--ink-faint)]">
                {trustedTeams.map((team, index) => (
                  <span key={`${team}-${index}`} className="rounded-full border border-[rgba(26,24,20,0.08)] bg-[rgba(250,248,244,0.9)] px-4 py-2">
                    {team}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Why DocWise</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Everything you need to work smarter.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              Purpose-built for professionals who cannot afford wrong answers.
            </p>
          </div>

          <div className="mt-12 grid gap-0 overflow-hidden rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[rgba(26,24,20,0.08)] md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className={`group bg-[var(--warm-white)] p-10 transition-all duration-300 hover:-translate-y-1 hover:bg-white ${index % 2 === 0 ? "animate-reveal-up animation-delay-1" : "animate-reveal-up animation-delay-2"}`}>
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--rust-light)] text-brand-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon size={24} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-sm leading-7 text-[var(--ink-muted)]">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">How it works</p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Three steps to answers.
              </h2>
              <div className="mt-10 space-y-0 border-t border-[rgba(26,24,20,0.10)]">
                {[
                  ["1", "Upload your documents", "Drag and drop any PDF, Word doc, or text file."],
                  ["2", "Ask in plain English", "No special syntax or commands needed."],
                  ["3", "Get cited answers", "Every answer links directly to the source."],
                ].map(([num, title, desc], index) => (
                  <div key={title} className={`flex gap-5 border-b border-[rgba(26,24,20,0.10)] py-7 animate-reveal-up ${index === 0 ? "animation-delay-1" : index === 1 ? "animation-delay-2" : "animation-delay-3"}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(26,24,20,0.18)] bg-[var(--warm-white)] text-sm font-bold text-[var(--ink-muted)]">
                      {num}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-muted)]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] p-8 shadow-[0_18px_50px_-24px_rgba(26,24,20,0.28)]">
              <div className="rounded-[1.5rem] border border-dashed border-[rgba(26,24,20,0.18)] bg-[var(--cream)] p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--rust-light)] text-brand-600">
                  <FileText size={28} />
                </div>
                <p className="text-lg font-bold">Drop your documents here</p>
                <p className="mt-2 text-sm text-[var(--ink-faint)]">PDF, DOCX, TXT. Up to 50MB.</p>
              </div>
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-[var(--cream)] p-4 text-sm text-[var(--ink-muted)]">
                  What are the key financial risks mentioned in the annual report?
                </div>
                <div className="rounded-2xl rounded-tl-none border border-[rgba(194,91,58,0.16)] bg-[linear-gradient(180deg,#fff7ef_0%,#f6e3d3_100%)] p-4 text-sm text-[var(--ink)] shadow-[0_18px_30px_-24px_rgba(194,91,58,0.22)]">
                  The report identifies currency exposure, supply-chain concentration, and rising debt servicing costs.
                  <div className="mt-3 inline-flex rounded-full bg-[var(--sage-light)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--sage)]">
                    Page 31 - Risk Factors
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">What people say</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Trusted by researchers, lawyers, and analysts.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["DocWise saved our legal team 12 hours a week on contract review.", "Sarah Rowe", "General Counsel, Northgate"],
              ["I uploaded three years of clinical trial data and had answers in minutes.", "Dr. Marcus Kim", "Research Director, Lumina Health"],
              ["Finally, an AI tool that gives you the exact page number.", "Tasha Liu", "Head of Compliance, Arxis"],
            ].map(([quote, name, role], index) => (
              <div key={name} className={`rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-34px_rgba(26,24,20,0.28)] animate-reveal-up ${index === 0 ? "animation-delay-1" : index === 1 ? "animation-delay-2" : "animation-delay-3"}`}>
                <p className="font-display text-lg italic leading-8 text-[var(--ink)]">"{quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--rust-light)] text-sm font-bold text-brand-600">
                    {String(name).split(" ").map((part) => part[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{name}</p>
                    <p className="text-xs text-[var(--ink-faint)]">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Pricing</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Simple, honest pricing.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">Start free and upgrade when you are ready.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={[
                  "relative rounded-[2.25rem] border p-8 transition-all duration-300 hover:-translate-y-1 animate-reveal-up",
                  index === 0 ? "animation-delay-1" : index === 1 ? "animation-delay-2" : "animation-delay-3",
                  plan.highlight
                    ? "border-[rgba(194,91,58,0.20)] bg-[linear-gradient(180deg,#fff6ec_0%,#f7e4d3_100%)] text-[var(--ink)] shadow-2xl shadow-[rgba(194,91,58,0.12)] hover:shadow-[0_28px_60px_-38px_rgba(194,91,58,0.28)]"
                    : "border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] hover:shadow-[0_28px_60px_-40px_rgba(26,24,20,0.24)]",
                ].join(" ")}
              >
                {plan.highlight && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 px-4 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                    Most popular
                  </div>
                )}
                <div className={plan.highlight ? "text-sm font-black uppercase tracking-[0.18em] text-[var(--rust-dark)]" : "text-sm font-black uppercase tracking-[0.18em] opacity-70"}>{plan.name}</div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-5xl font-bold">{plan.price}</span>
                  <span className={plan.highlight ? "pb-1 text-sm text-[var(--ink-muted)]" : "pb-1 text-sm opacity-70"}>{plan.period}</span>
                </div>
                <div className={plan.highlight ? "my-8 h-px bg-[rgba(26,24,20,0.10)]" : "my-8 h-px bg-[rgba(26,24,20,0.10)]"} />
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm">
                      <Check size={16} className="text-brand-500" />
                      <span className={plan.highlight ? "text-[var(--ink-muted)]" : "text-[var(--ink-muted)]"}>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="w-full rounded-2xl py-3 font-bold" variant={plan.highlight ? "primary" : "outline"}>
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[rgba(194,91,58,0.18)] bg-[linear-gradient(180deg,#fff7ef_0%,#f5e1d1_100%)] px-8 py-16 text-center text-[var(--ink)] shadow-[0_24px_60px_-32px_rgba(194,91,58,0.20)] sm:px-12">
            <div className="absolute left-10 top-8 h-20 w-20 rounded-full bg-[rgba(196,71,30,0.10)] blur-2xl animate-float" />
            <div className="absolute bottom-8 right-12 h-24 w-24 rounded-full bg-[rgba(74,103,65,0.10)] blur-2xl animate-float-delayed" />
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl text-[var(--ink)]">
              Ready to talk to your documents?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
              Join thousands of professionals who get answers in seconds, not hours.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 rounded-2xl px-8 text-base font-bold">Start for free</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-14 rounded-2xl px-8 text-base font-bold bg-white text-[var(--ink)] hover:bg-[var(--cream)]">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(26,24,20,0.08)] bg-[var(--warm-white)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <span className="font-display text-xl font-bold">DocWise</span>
          <div className="flex flex-wrap gap-6 text-sm text-[var(--ink-faint)]">
            <span>Features</span>
            <span>Pricing</span>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
            DocWise © 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
