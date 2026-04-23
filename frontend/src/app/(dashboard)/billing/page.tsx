"use client";

import { CreditCard, Zap, Check, ShieldCheck, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useUsage } from "@/hooks/useUsage";
import { useBilling } from "@/hooks/useBilling";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/store/toastStore";
import Modal from "@/components/ui/Modal";

declare global {
  interface Window {
    CollectJS?: {
      configure: (config: any) => void;
    };
  }
}

type PaidPlanId = "STARTER" | "PRO";

const PLANS_INFO = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    description: "Perfect for students and casual reading.",
    features: ["20 questions / month", "Up to 5 documents", "10MB max file size", "Community support"],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "$19",
    description: "Ideal for researchers and small projects.",
    features: ["200 questions / month", "Up to 20 documents", "20MB max file size", "Email support"],
    planId: "STARTER" as PaidPlanId,
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$49",
    description: "Best for professionals and deep analysis.",
    features: ["Unlimited questions", "Unlimited documents", "50MB max file size", "Priority support", "Multi-doc queries"],
    popular: true,
    planId: "PRO" as PaidPlanId,
  },
];

function isPaidPlan(plan: (typeof PLANS_INFO)[number]): plan is (typeof PLANS_INFO)[number] & { planId: PaidPlanId } {
  return plan.id === "STARTER" || plan.id === "PRO";
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { usage, questionPercentage, storagePercentage } = useUsage();
  const { createCheckoutSession, openCustomerPortal, isLoading } = useBilling();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<PaidPlanId | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const nmiPublicKey = process.env.NEXT_PUBLIC_NMI_COLLECT_JS_KEY || "";

  useEffect(() => {
    if (searchParams.get("billing_cancelled")) {
      toast.error("Checkout Cancelled", "Your plan was not changed. If you have questions, please contact support.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
    if (user?.name && !firstName) {
      const [first, ...rest] = user.name.split(" ");
      setFirstName(first || "");
      setLastName(rest.join(" "));
    }
  }, [user, email, firstName]);

  useEffect(() => {
    if (!showPaymentModal || !nmiPublicKey || !selectedPlanId) return;

    const loadCollectJs = async () => {
      const existing = document.getElementById("nmi-collect-js") as HTMLScriptElement | null;
      if (!existing) {
        const script = document.createElement("script");
        script.id = "nmi-collect-js";
        script.src = "https://secure.nmi.com/token/Collect.js";
        script.setAttribute("data-tokenization-key", nmiPublicKey);
        script.setAttribute("data-variant", "inline");
        document.body.appendChild(script);
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load NMI Collect.js"));
        });
      } else if (!window.CollectJS) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (!window.CollectJS) {
        toast.error("Payment unavailable", "NMI payment fields could not be initialized.");
        return;
      }

      window.CollectJS.configure({
        variant: "inline",
        paymentSelector: "#nmiPayButton",
        fields: {
          ccnumber: {
            selector: "#nmiCcnumber",
            title: "Card Number",
            placeholder: "0000 0000 0000 0000",
          },
          ccexp: {
            selector: "#nmiCcexp",
            title: "Expiration",
            placeholder: "MM / YY",
          },
          cvv: {
            selector: "#nmiCvv",
            title: "CVV",
            placeholder: "123",
          },
        },
        callback: async (response: any) => {
          const token = response?.token;
          if (!token || !selectedPlanId) {
            toast.error("Payment failed", "Unable to tokenize payment method.");
            return;
          }

          if (!firstName || !lastName || !email) {
            toast.error("Missing details", "Please fill in your billing details.");
            return;
          }

          try {
            await createCheckoutSession({
              planId: selectedPlanId,
              paymentToken: token,
              firstName,
              lastName,
              email,
            });
            setShowPaymentModal(false);
          } catch {
            // Error toast is handled in useBilling
          }
        },
      });
    };

    loadCollectJs().catch((err) => {
      toast.error("Payment unavailable", err.message || "Unable to initialize payment form.");
    });
  }, [showPaymentModal, nmiPublicKey, selectedPlanId, firstName, lastName, email, createCheckoutSession]);

  const currentPlan = user?.plan || "FREE";

  const handleUpgrade = (planId?: PaidPlanId) => {
    if (!planId) return;
    if (!nmiPublicKey) {
      toast.error("Payment unavailable", "Missing NMI public key configuration.");
      return;
    }
    setSelectedPlanId(planId);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Subscription & Billing</h2>
          <p className="text-slate-500 font-medium mt-1">Manage your plan and view your usage metrics.</p>
        </div>
        {currentPlan !== "FREE" && (
          <Button variant="outline" size="sm" onClick={openCustomerPortal} className="gap-2">
            Cancel Subscription
            <ExternalLink size={14} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Questions Used</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-black text-slate-900">
              {usage?.questionsUsed || 0}
              <span className="text-sm font-bold text-slate-400"> / {usage?.questionsLimit || 20}</span>
            </span>
            <span className="text-xs font-bold text-brand-600">{questionPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${questionPercentage}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Storage Used</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-black text-slate-900">
              {usage?.storageUsedMB || 0}
              <span className="text-sm font-bold text-slate-400"> MB</span>
            </span>
            <span className="text-xs font-bold text-emerald-600">{storagePercentage < 100 ? "Healthy" : "Full"}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${storagePercentage}%` }} />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-[rgba(194,91,58,0.16)] bg-[linear-gradient(180deg,#fff7ef_0%,#f7e7d8_100%)] p-6 text-[var(--ink)] shadow-xl shadow-[rgba(194,91,58,0.12)]">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-muted)]">Current Plan</p>
            <Zap size={20} className="fill-[var(--rust)] text-[var(--rust)]" />
          </div>
          <div>
            <h3 className="text-2xl font-black capitalize text-[var(--ink)]">{currentPlan.toLowerCase()}</h3>
            <p className="mt-1 text-xs font-medium text-[var(--ink-muted)]">Monthly billing active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        {PLANS_INFO.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative bg-white border rounded-[2.5rem] p-8 flex flex-col transition-all duration-300",
                plan.popular ? "border-brand-500 shadow-2xl shadow-brand-500/10 scale-105 z-10" : "border-slate-200 hover:border-slate-300",
                isCurrent && "bg-slate-50/50"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h4 className="text-xl font-black text-slate-900">{plan.name}</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-sm font-bold text-slate-400">/mo</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-1 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <Check size={10} strokeWidth={4} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                disabled={isCurrent || isLoading}
                loading={isLoading && !isCurrent}
                onClick={() => handleUpgrade(isPaidPlan(plan) ? plan.planId : undefined)}
                className={cn(
                  "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                  plan.popular ? "bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25" : "bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50"
                )}
              >
                {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-[3rem] border border-[rgba(194,91,58,0.16)] bg-[linear-gradient(180deg,#fff7ef_0%,#f8eadf_100%)] p-12 text-[var(--ink)]">
        <div className="absolute top-0 right-0 p-8 opacity-[0.08] text-[var(--rust-dark)]">
          <CreditCard size={200} />
        </div>
        <div className="max-w-2xl relative z-10">
          <h3 className="mb-4 text-2xl font-black">Payment Security</h3>
          <p className="mb-6 text-sm leading-relaxed text-[var(--ink-muted)]">
            All payments are processed securely via NMI. Card data is tokenized by NMI Collect.js, and your raw card details never pass through our servers.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--ink-muted)]">PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--ink-muted)]">256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Complete Your Subscription"
        description="Enter billing details and payment information to activate your plan."
        variant="brand"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <button id="nmiPayButton" type="button" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Processing..." : "Pay & Activate"}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <input className="input-base" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input className="input-base" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <input className="input-base mb-5" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        <div className="space-y-3">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Card Number</div>
          <div id="nmiCcnumber" className="input-base min-h-10" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Expiry</div>
              <div id="nmiCcexp" className="input-base min-h-10" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">CVV</div>
              <div id="nmiCvv" className="input-base min-h-10" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
