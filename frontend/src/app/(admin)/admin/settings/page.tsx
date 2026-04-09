"use client";

import { useState } from "react";
import { 
  Settings, 
  Mail, 
  Globe, 
  Shield, 
  Database, 
  Bell,
  Save,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle
} from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-zinc-100 last:border-0">
      <div>
        <p className="text-sm font-black text-zinc-900">{label}</p>
        {description && <p className="text-xs font-bold text-zinc-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-all duration-300 shrink-0",
          enabled ? "bg-zinc-900" : "bg-zinc-200"
        )}
      >
        <span className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300",
          enabled ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    emailVerification: true,
    newUserRegistration: true,
    aiStreaming: true,
    usageLimits: true,
    analyticsTracking: true,
  });

  const toggle = (key: keyof typeof settings) => 
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">System Settings</h2>
        <p className="text-zinc-500 font-bold mt-1 uppercase text-xs tracking-widest">
          Platform-wide configuration and feature flags
        </p>
      </div>

      {/* Feature Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-zinc-200 rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
              <Settings size={20} className="text-zinc-600" />
            </div>
            <h3 className="text-base font-black text-zinc-900 uppercase tracking-tight">Feature Flags</h3>
          </div>
          <div>
            <Toggle
              enabled={settings.maintenanceMode}
              onChange={() => toggle("maintenanceMode")}
              label="Maintenance Mode"
              description="Show maintenance page to all users"
            />
            <Toggle
              enabled={settings.newUserRegistration}
              onChange={() => toggle("newUserRegistration")}
              label="New User Registration"
              description="Allow new accounts to be created"
            />
            <Toggle
              enabled={settings.emailVerification}
              onChange={() => toggle("emailVerification")}
              label="Email Verification"
              description="Require email confirmation on signup"
            />
            <Toggle
              enabled={settings.aiStreaming}
              onChange={() => toggle("aiStreaming")}
              label="AI Response Streaming"
              description="Stream AI tokens in real-time via SSE"
            />
            <Toggle
              enabled={settings.usageLimits}
              onChange={() => toggle("usageLimits")}
              label="Usage Limit Enforcement"
              description="Block users who exceed plan limits"
            />
            <Toggle
              enabled={settings.analyticsTracking}
              onChange={() => toggle("analyticsTracking")}
              label="Analytics Tracking"
              description="Collect anonymous usage data"
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Email Config */}
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                <Mail size={20} className="text-zinc-600" />
              </div>
              <h3 className="text-base font-black text-zinc-900 uppercase tracking-tight">Email Config</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">From Address</label>
                <input
                  defaultValue="noreply@docwise.ai"
                  className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Resend API Key</label>
                <input
                  defaultValue="re_••••••••••••••••"
                  type="password"
                  className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            </div>
          </div>

          {/* Plan Limits */}
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-zinc-600" />
              </div>
              <h3 className="text-base font-black text-zinc-900 uppercase tracking-tight">Plan Limits</h3>
            </div>
            <div className="space-y-4">
              {[
                { plan: "FREE", questions: 20, docs: 5 },
                { plan: "STARTER", questions: 200, docs: 20 },
                { plan: "PRO", questions: 9999, docs: 9999 },
              ].map(p => (
                <div key={p.plan} className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-tight px-2.5 py-1 rounded-lg",
                    p.plan === 'PRO' ? "bg-brand-100 text-brand-700" : "bg-zinc-100 text-zinc-600"
                  )}>{p.plan}</span>
                  <div className="text-right">
                    <p className="text-xs font-black text-zinc-900">{p.questions === 9999 ? '∞' : p.questions} questions</p>
                    <p className="text-[10px] font-bold text-zinc-400">{p.docs === 9999 ? 'unlimited' : p.docs} docs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border-2 border-red-100 rounded-[2rem] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h3 className="text-base font-black text-red-600 uppercase tracking-tight">Danger Zone</h3>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-zinc-900">Purge All Vector Data</p>
            <p className="text-xs font-bold text-zinc-400 mt-0.5">Delete all embeddings from Pinecone. Cannot be undone.</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 shadow-red-200 shrink-0">
            Purge Vectors
          </Button>
        </div>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-8 flex justify-end">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl flex items-center gap-4 p-3 pr-5">
          <p className="text-xs font-bold text-zinc-500 hidden sm:block">Unsaved changes pending</p>
          <Button variant="secondary" className="gap-2">
            <RefreshCw size={16} />
            Reset
          </Button>
          <Button className="bg-zinc-900 gap-2">
            <Save size={16} />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
