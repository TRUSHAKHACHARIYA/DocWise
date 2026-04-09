"use client";

import { CreditCard, Zap, Check, AlertCircle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for students and casual reading.",
    features: ["20 questions / month", "Up to 5 documents", "10MB max file size", "Community support"],
    current: true,
  },
  {
    name: "Starter",
    price: "$12",
    description: "Ideal for researchers and small projects.",
    features: ["200 questions / month", "Up to 20 documents", "20MB max file size", "Email support"],
  },
  {
    name: "Pro",
    price: "$29",
    description: "Best for professionals and deep analysis.",
    features: ["Unlimited questions", "Unlimited documents", "50MB max file size", "Priority support", "Multi-doc queries"],
    popular: true,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Subscription & Billing</h2>
        <p className="text-slate-500 font-medium mt-1">Manage your plan and view your usage metrics.</p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Questions Used</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-black text-slate-900">9 <span className="text-sm font-bold text-slate-400">/ 20</span></span>
            <span className="text-xs font-bold text-brand-600">45%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 w-[45%]" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Storage Used</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-black text-slate-900">8.4 <span className="text-sm font-bold text-slate-400">MB</span></span>
            <span className="text-xs font-bold text-emerald-600">Healthy</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[15%]" />
          </div>
        </div>

        <div className="bg-brand-600 rounded-3xl p-6 shadow-xl shadow-brand-500/20 text-white flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Current Plan</p>
            <Zap size={20} className="fill-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black">Free Plan</h3>
            <p className="text-xs opacity-70 mt-1 font-medium">Renews on Nov 12, 2023</p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        {PLANS.map((plan) => (
          <div 
            key={plan.name} 
            className={cn(
              "relative bg-white border rounded-[2.5rem] p-8 flex flex-col transition-all duration-300",
              plan.popular ? "border-brand-500 shadow-2xl shadow-brand-500/10 scale-105 z-10" : "border-slate-200 hover:border-slate-300",
              plan.current && "bg-slate-50/50"
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
              disabled={plan.current}
              className={cn(
                "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                plan.popular ? "bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25" : "bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50"
              )}
            >
              {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>

      {/* FAQ / Info */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <CreditCard size={200} />
        </div>
        <div className="max-w-2xl relative z-10">
          <h3 className="text-2xl font-black mb-4">Payment Security</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            All payments are processed securely via Stripe. We do not store your credit card information on our servers. You can cancel your subscription at any time with a single click.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

const ShieldCheck = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
