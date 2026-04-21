"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "@/store/toastStore";
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Terminal, 
  ShieldAlert,
  Loader2,
  Code
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function DeveloperSettingsPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await api.get("/keys");
      setKeys(response.data.keys);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName) return;
    setIsCreating(true);
    try {
      const response = await api.post("/keys", { name: newKeyName });
      setRevealedKey(response.data.key);
      setKeys(prev => [response.data, ...prev]);
      setNewKeyName("");
      toast.success("Key Created", "Make sure to copy it now. You won't see it again.");
    } catch (err: any) {
      toast.error("Error", err.response?.data?.error || "Failed to create key");
    } finally {
      setIsCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Are you sure? Any applications using this key will immediately stop working.")) return;
    try {
      await api.delete(`/keys/${id}`);
      setKeys(prev => prev.filter(k => k.id !== id));
      toast.success("Key Revoked", "The API key has been invalidated.");
    } catch (err) {
      toast.error("Error", "Failed to revoke key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEligible = user?.plan === 'PRO' || user?.plan === 'ENTERPRISE' || user?.role === 'ADMIN';

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Developer API</h2>
        <p className="text-slate-500 dark:text-zinc-400 font-medium">Build custom integrations and automate your document intelligence.</p>
      </div>

      {!isEligible ? (
        <div className="p-10 bg-brand-50 dark:bg-zinc-900/50 border border-brand-100 dark:border-zinc-800 rounded-[2.5rem] text-center space-y-6">
          <div className="w-16 h-16 bg-brand-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-brand-600 mx-auto">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upgrade to Pro</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              API access is reserved for Pro and Enterprise users. Upgrade your plan to start building with DocWise.
            </p>
          </div>
          <Button className="mx-auto" onClick={() => window.location.href='/billing'}>View Pricing</Button>
        </div>
      ) : (
        <>
          {/* Key Creation */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Key size={20} className="text-brand-500" />
              Manage API Keys
            </h3>

            {revealedKey ? (
              <div className="space-y-4 animate-in zoom-in duration-300">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">New API Key Created</p>
                    <code className="text-sm font-mono font-bold text-slate-900 dark:text-white break-all">{revealedKey}</code>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(revealedKey)}
                    className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm text-slate-600 dark:text-zinc-300 hover:text-brand-600 transition-colors shrink-0 ml-4"
                  >
                    {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center">
                  ⚠️ Save this key now! It will never be shown again.
                </p>
                <div className="flex justify-center">
                   <Button variant="outline" size="sm" onClick={() => setRevealedKey(null)}>I've saved it</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input 
                    placeholder="E.g. Production Mobile App" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={createKey} 
                  disabled={isCreating || !newKeyName}
                  className="shrink-0"
                >
                  {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  Create New Key
                </Button>
              </div>
            )}

            <div className="mt-10 space-y-4">
               {isLoading ? (
                 <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></div>
               ) : keys.map(key => (
                 <div key={key.id} className="p-5 border border-slate-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
                          <Terminal size={20} />
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{key.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Created {new Date(key.createdAt).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Used</p>
                          <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                             {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                          </p>
                       </div>
                       <button 
                         onClick={() => revokeKey(key.id)}
                         className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                       >
                          <Trash2 size={18} />
                       </button>
                    </div>
                 </div>
               ))}
               {!isLoading && keys.length === 0 && (
                 <div className="py-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest italic border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl">
                    No active API keys
                 </div>
               )}
            </div>
          </div>

          {/* Quick Start Docs */}
          <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Code size={120} />
             </div>
             <h3 className="text-xl font-black uppercase tracking-tight mb-6">Quick Start Guide</h3>
             <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Authentication</p>
                   <code className="block p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-sm">
                      Authorization: Bearer DW_YOUR_KEY
                   </code>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Endpoint Example</p>
                   <code className="block p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-sm leading-relaxed">
                      POST /api/chat<br/>
                      {JSON.stringify({ message: "What is in my docs?", session_id: "...", stream: true }, null, 2)}
                   </code>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Full API Reference</Button>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
