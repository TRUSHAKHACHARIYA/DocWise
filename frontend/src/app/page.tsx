import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  FolderOpen,
  GitCompare,
  Lock,
  Scale,
  ScrollText,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import HeroVisual from "@/components/dashboard/HeroVisual";

const coreBenefits = [
  {
    icon: Zap,
    title: "Grounded citations",
    desc: "Every answer links to the exact page and passage—click to verify in the PDF viewer.",
  },
  {
    icon: FolderOpen,
    title: "Multi-document queries",
    desc: "Ask across contracts, policies, and reports in one session—not one file at a time.",
  },
  {
    icon: Shield,
    title: "Secure workspaces",
    desc: "Isolated tenant spaces with role-based access so teams stay in control.",
  },
  {
    icon: GitCompare,
    title: "Compare workflows",
    desc: "Surface differences across document sets with cited evidence (roadmap).",
  },
  {
    icon: Users,
    title: "Team collaboration",
    desc: "Shared libraries, admin oversight, and usage visibility for growing teams.",
  },
  {
    icon: Lock,
    title: "Governance built in",
    desc: "Audit logs, quotas, and admin analytics for compliance-heavy workflows.",
  },
];

const useCases = [
  {
    icon: Scale,
    title: "Contract review",
    desc: "Query clauses, obligations, and risks across agreements with page-level citations.",
  },
  {
    icon: ScrollText,
    title: "Policy & SOP Q&A",
    desc: "Find answers across handbooks, policies, and standard operating procedures instantly.",
  },
  {
    icon: BookOpen,
    title: "Research libraries",
    desc: "Analyze reports, papers, and filings together—built for analyst and research teams.",
  },
  {
    icon: FileText,
    title: "Due diligence",
    desc: "Upload deal rooms and disclosure documents; get cited summaries under deadline pressure.",
  },
  {
    icon: Users,
    title: "Internal knowledge",
    desc: "Turn scattered PDFs and Word docs into a searchable, cited team knowledge base.",
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
  "Grounded answers with source citations",
  "Ask across multiple documents at once",
  "Admin controls and audit trails",
];

const trustedTeams = ["Meridian Legal", "Northgate Compliance", "Arxis Research", "Lumina Health", "Crestview Ops", "Meridian Legal", "Northgate Compliance", "Arxis Research", "Lumina Health", "Crestview Ops"];

const governanceItems = [
  "Audit logging for logins, uploads, and deletions",
  "Role-based access control (User / Admin)",
  "Plan-based usage quotas and storage limits",
  "Password-confirmed account deletion with data cleanup",
  "API key auth for programmatic access (Pro+)",
];

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
            <a href="#benefits" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">Benefits</a>
            <a href="#use-cases" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">Use cases</a>
            <a href="#how-it-works" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">How it works</a>
            <a href="#security" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">Security</a>
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
              Secure document intelligence
            </Badge>
            <h1 className="animate-reveal-up animation-delay-2 max-w-2xl font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl lg:text-[3.4rem]">
              Ask your contracts, policies, and reports anything—
              <em className="italic text-brand-600"> with citations you can trust.</em>
            </h1>
            <p className="animate-reveal-up animation-delay-3 mt-6 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">
              DocWise turns document libraries into secure AI workspaces for teams. Ask questions across multiple documents, verify every answer with citations, and manage access with admin controls.
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
              No credit card required. Built for legal, compliance, and research teams.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {proofPoints.map((item, index) => (
                <div
                  key={item}
                  className={`animate-reveal-up rounded-[1.5rem] border border-[rgba(26,24,20,0.08)] bg-[rgba(255,253,249,0.7)] px-4 py-4 shadow-[0_18px_40px_-30px_rgba(26,24,20,0.28)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 ${index === 0 ? "animation-delay-3" : index === 1 ? "animation-delay-4" : "animation-delay-5"}`}
                >
                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--rust-dark)]">Why teams choose DocWise</div>
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
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">Trusted by legal, research &amp; knowledge teams</span>
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

        <section id="benefits" className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Core benefits</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
              A workspace—not a single-PDF chat tool.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              Purpose-built for teams who need grounded answers, governance, and control across large document libraries.
            </p>
          </div>

          <div className="mt-12 grid gap-0 overflow-hidden rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[rgba(26,24,20,0.08)] md:grid-cols-2 lg:grid-cols-3">
            {coreBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className={`group bg-[var(--warm-white)] p-10 transition-all duration-300 hover:-translate-y-1 hover:bg-white animate-reveal-up ${index % 3 === 0 ? "animation-delay-1" : index % 3 === 1 ? "animation-delay-2" : "animation-delay-3"}`}
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--rust-light)] text-brand-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon size={24} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{benefit.title}</h3>
                  <p className="text-sm leading-7 text-[var(--ink-muted)]">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="use-cases" className="border-y border-[rgba(26,24,20,0.08)] bg-[var(--warm-white)] px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Use cases</p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Built for serious document work.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
                From contract review to policy search—DocWise fits workflows where wrong answers are costly.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <div
                    key={useCase.title}
                    className={`rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[var(--cream)] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-34px_rgba(26,24,20,0.28)] animate-reveal-up ${index === 0 ? "animation-delay-1" : index === 1 ? "animation-delay-2" : "animation-delay-3"}`}
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--rust-light)] text-brand-600">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold">{useCase.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">{useCase.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">How it works</p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Upload. Ask across docs. Verify with citations.
              </h2>
              <div className="mt-10 space-y-0 border-t border-[rgba(26,24,20,0.10)]">
                {[
                  ["1", "Upload your library", "Add contracts, policies, reports, and research—PDF or Word."],
                  ["2", "Ask across documents", "Select multiple files and query your workspace in plain English."],
                  ["3", "Verify every answer", "Citations jump to the exact page and highlight the source passage."],
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
              <div className="mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--rust-dark)]">Live workspace preview</div>
              <div className="rounded-[1.5rem] border border-dashed border-[rgba(26,24,20,0.18)] bg-[var(--cream)] p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--rust-light)] text-brand-600">
                  <FolderOpen size={28} />
                </div>
                <p className="text-lg font-bold">3 documents selected</p>
                <p className="mt-2 text-sm text-[var(--ink-faint)]">MSA_2024.pdf · Security_Policy.docx · Q3_Report.pdf</p>
              </div>
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-[var(--cream)] p-4 text-sm text-[var(--ink-muted)]">
                  What termination clauses apply if we exit before the renewal date?
                </div>
                <div className="rounded-2xl rounded-tl-none border border-[rgba(194,91,58,0.16)] bg-[linear-gradient(180deg,#fff7ef_0%,#f6e3d3_100%)] p-4 text-sm text-[var(--ink)] shadow-[0_18px_30px_-24px_rgba(194,91,58,0.22)]">
                  Section 12.3 requires 90 days written notice. Early termination triggers a pro-rated fee per Exhibit B.
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="inline-flex rounded-full bg-[var(--sage-light)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--sage)]">
                      MSA_2024.pdf — p. 14
                    </div>
                    <div className="inline-flex rounded-full bg-[var(--sage-light)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--sage)]">
                      Exhibit B — p. 2
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">What teams say</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Trusted by legal, compliance, and research leaders.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["DocWise cut our contract review cycle from days to hours—with citations we can defend.", "Sarah Rowe", "General Counsel, Northgate"],
              ["We query policies and SOPs across departments without losing source traceability.", "Tasha Liu", "Head of Compliance, Arxis"],
              ["Multi-document research across three years of filings—every claim linked to a page.", "Dr. Marcus Kim", "Research Director, Lumina Health"],
            ].map(([quote, name, role], index) => (
              <div key={name} className={`rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[var(--warm-white)] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-34px_rgba(26,24,20,0.28)] animate-reveal-up ${index === 0 ? "animation-delay-1" : index === 1 ? "animation-delay-2" : "animation-delay-3"}`}>
                <p className="font-display text-lg italic leading-8 text-[var(--ink)]">&ldquo;{quote}&rdquo;</p>
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

        <section id="security" className="border-y border-[rgba(26,24,20,0.08)] bg-[var(--warm-white)] px-6 py-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Security &amp; governance</p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Enterprise trust, from day one.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
                DocWise is built for teams that need more than a chatbot—audit trails, access control, and visibility across the workspace.
              </p>
              <div className="mt-8 space-y-4">
                {governanceItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-[var(--ink-muted)]">
                    <Check size={16} className="mt-0.5 shrink-0 text-brand-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-[rgba(26,24,20,0.10)] bg-[var(--cream)] p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--rust-light)] text-brand-600">
                  <Lock size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">Admin oversight</p>
                  <p className="text-xs text-[var(--ink-faint)]">Analytics, audit logs, and queue triage</p>
                </div>
              </div>
              <div className="mt-6 space-y-3 rounded-[1.5rem] border border-[rgba(26,24,20,0.08)] bg-[var(--warm-white)] p-5 text-sm">
                <div className="flex justify-between border-b border-[rgba(26,24,20,0.08)] pb-3">
                  <span className="text-[var(--ink-faint)]">Active users</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between border-b border-[rgba(26,24,20,0.08)] pb-3">
                  <span className="text-[var(--ink-faint)]">Documents this month</span>
                  <span className="font-semibold">186</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-faint)]">Audit events (7d)</span>
                  <span className="font-semibold">1,042</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-[var(--ink-faint)]">Illustrative admin dashboard metrics.</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Pricing</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Simple, honest pricing.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">Start free. Upgrade when your team needs more documents, questions, or API access.</p>
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
                <div className="my-8 h-px bg-[rgba(26,24,20,0.10)]" />
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm">
                      <Check size={16} className="text-brand-500" />
                      <span className="text-[var(--ink-muted)]">{feature}</span>
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
              Ready to turn your document library into an AI workspace?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
              Join legal, compliance, and research teams who get grounded, cited answers across their entire library.
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
            <a href="#benefits" className="hover:text-[var(--ink)]">Benefits</a>
            <a href="#use-cases" className="hover:text-[var(--ink)]">Use cases</a>
            <a href="#security" className="hover:text-[var(--ink)]">Security</a>
            <a href="#pricing" className="hover:text-[var(--ink)]">Pricing</a>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
            DocWise © 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
