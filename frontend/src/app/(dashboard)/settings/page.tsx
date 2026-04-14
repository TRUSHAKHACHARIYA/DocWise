"use client";

import { useState } from "react";
import { User, Lock, Bell, Shield, Key, Trash2, Save } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

import { toast } from "@/store/toastStore";
import api from "@/lib/api";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'api'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [profileName, setProfileName] = useState(user?.name || "");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'api', label: 'API Access', icon: Key },
  ];

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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-slate-500 font-medium mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Tabs Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-white shadow-md text-brand-600 border border-slate-100" 
                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                )}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Profile Picture</h3>
                  <p className="text-sm text-slate-500 mb-4">Upload a custom avatar for your account.</p>
                  <div className="flex items-center gap-3">
                    <Button size="sm">Upload New</Button>
                    <Button size="sm" variant="outline">Remove</Button>
                  </div>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)} 
                    placeholder="Jane Doe" 
                  />
                  <Input label="Email Address" defaultValue={user?.email || ""} placeholder="jane@example.com" disabled />
                </div>
                <Input label="Job Title" placeholder="Research Analyst" />
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" loading={isLoading} className="gap-2">
                    <Save size={18} />
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                <form className="space-y-4 max-w-md" onSubmit={handlePasswordChange}>
                  <Input 
                    type="password" 
                    label="Current Password" 
                    placeholder="••••••••" 
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  />
                  <Input 
                    type="password" 
                    label="New Password" 
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
                  <Button type="submit" loading={isLoading} className="mt-2">Update Password</Button>
                </form>
              </div>

              <div className="pt-10 border-t border-slate-100">
                <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-500 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 gap-2">
                  <Trash2 size={18} />
                  Delete Account
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-brand-50 rounded-3xl p-6 border border-brand-100 flex items-start gap-4">
                <Shield className="text-brand-600 shrink-0" size={24} />
                <div>
                  <h4 className="text-sm font-bold text-brand-900">Developer Access</h4>
                  <p className="text-xs text-brand-700 leading-relaxed mt-1">
                    API access is currently in invitation-only beta. If you are a Pro user, you can generate keys to integrate DocWise into your own applications.
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Your API Keys</h3>
                  <Button size="sm" className="gap-2">
                    <Plus size={16} />
                    New Key
                  </Button>
                </div>
                
                <div className="border-2 border-dashed border-slate-100 rounded-3xl p-12 text-center">
                  <p className="text-sm font-bold text-slate-400">No active API keys found.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Plus = ({ size, className }: { size: number, className?: string }) => (
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
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
