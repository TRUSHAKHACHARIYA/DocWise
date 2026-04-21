"use client";

import { useState, useEffect } from "react";
import { User, Lock, Bell, Shield, Key, Trash2, Save, History, Smartphone, Globe, CheckCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

import { toast } from "@/store/toastStore";
import api from "@/lib/api";

type TabType = 'profile' | 'security' | 'api' | 'activity';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Form states
  const [profileName, setProfileName] = useState(user?.name || "");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'activity', label: 'Activity Logs', icon: History },
    { id: 'api', label: 'API Access', icon: Key },
  ];

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/user/activity");
      setLogs(response.data.logs);
    } catch (err) {
      toast.error("Error", "Failed to load activity logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.patch("/user/profile", { name: profileName });
      updateUser(response.data.user);
      toast.success("Success", "Profile updated successfully.");
    } catch (err) {
      toast.error("Error", "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error("Error", "Passwords do not match.");
    }
    
    setIsLoading(true);
    try {
      await api.post("/user/change-password", { 
        currentPassword: passwords.current, 
        newPassword: passwords.new 
      });
      setPasswords({ current: "", new: "", confirm: "" });
      toast.success("Success", "Password changed successfully.");
    } catch (err: any) {
      toast.error("Error", err.response?.data?.error || "Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Control Center</h2>
        <p className="text-slate-500 font-medium mt-1">Personalize your DocWise experience and manage security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs Sidebar */}
        <aside className="w-full md:w-72 shrink-0 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-3xl text-sm font-bold transition-all group",
                  activeTab === tab.id 
                    ? "bg-slate-900 shadow-xl shadow-slate-200 text-white" 
                    : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                )}
              >
                <Icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === tab.id ? "text-brand-400" : "text-slate-400")} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm min-h-[600px]">
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-slate-50">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-4xl font-black shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                    {user?.name?.charAt(0) || "U"}
                    </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identity</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Update your profile information and avatar.</p>
                  <div className="flex items-center gap-3 mt-6 justify-center sm:justify-start">
                    <Button size="sm" className="rounded-xl">Upload Avatar</Button>
                    <Button size="sm" variant="outline" className="rounded-xl">Remove</Button>
                  </div>
                </div>
              </div>

              <form className="space-y-8" onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="Display Name" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)} 
                    placeholder="Jane Doe" 
                    className="font-bold"
                  />
                  <Input 
                    label="Email Address" 
                    defaultValue={user?.email || ""} 
                    disabled 
                    className="opacity-60 grayscale font-bold"
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" loading={isLoading} className="gap-2 h-12 px-8 rounded-2xl shadow-lg shadow-brand-500/10">
                    <Save size={18} />
                    Synchronize Profile
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-10 animate-fade-in">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Authentication</h3>
                        <p className="text-sm text-slate-500 font-medium">Secure your account with a strong password.</p>
                    </div>
                </div>

                <form className="space-y-6 max-w-md" onSubmit={handlePasswordChange}>
                  <Input 
                    type="password" 
                    label="Current Password" 
                    placeholder="••••••••" 
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  />
                  <Input 
                    type="password" 
                    label="New Secure Password" 
                    placeholder="••••••••" 
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  />
                  <Input 
                    type="password" 
                    label="Confirm New Password" 
                    placeholder="••••••••" 
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  />
                  <Button type="submit" loading={isLoading} className="mt-4 h-12 w-full rounded-2xl shadow-lg shadow-slate-100">Update Credentials</Button>
                </form>
              </div>

              <div className="pt-10 border-t border-slate-50">
                <h3 className="text-lg font-black text-rose-600 uppercase tracking-tight flex items-center gap-2">
                    <Trash2 size={18} />
                    Danger Zone
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-2 mb-8 max-w-sm">Account deletion is permanent. All documents, chats, and processing data will be purged.</p>
                <Button variant="outline" className="text-rose-600 border-rose-100 rounded-2xl hover:bg-rose-50 hover:border-rose-300 font-bold px-8">
                  Deactivate Account
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Login Activity</h3>
                  <p className="text-sm text-slate-500 font-medium">Recent security events and account access.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchLogs} className="gap-2 text-xs uppercase font-black tracking-widest text-brand-600">
                    <History size={14} />
                    Refresh
                </Button>
              </div>

              {isLoading && logs.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-[2rem] bg-slate-100 animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log, i) => (
                    <div key={log.id} className="p-5 rounded-[2rem] border border-slate-50 bg-slate-50/30 flex items-center gap-5 hover:bg-white hover:border-slate-100 transition-all group" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                          log.action?.includes('PASSWORD') ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {log.action?.includes('PASSWORD') ? <Shield size={20} /> : <CheckCircle size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.action?.replace(/_/g, ' ')}</p>
                        <div className="flex items-center gap-3 mt-1.5 font-bold">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <History size={10} />
                                {new Date(log.createdAt).toLocaleString()}
                            </span>
                            {log.ipAddress && (
                                <span className="text-[10px] text-slate-300 flex items-center gap-1">
                                    <Globe size={10} />
                                    {log.ipAddress}
                                </span>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                        <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No recent events recorded</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-6">
                    <Shield size={32} />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-2">Advanced API Access</h4>
                <p className="text-sm font-medium text-slate-400 max-w-sm mb-10 leading-relaxed">
                   Programmatically interact with your documents. Generate API keys to integrate DocWise into your own applications.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex items-center gap-4">
                    <Key size={20} className="text-brand-400" />
                    <span className="text-xs font-bold text-slate-500 flex-1 text-left">Upgrade to <span className="text-white">Enterprise Plan</span> to unlock full API capabilities.</span>
                    <Button size="sm" className="bg-white text-slate-950 hover:bg-slate-100">Upgrade</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
