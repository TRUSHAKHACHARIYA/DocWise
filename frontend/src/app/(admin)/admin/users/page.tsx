"use client";

import { useState } from "react";
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Calendar,
  Shield,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const MOCK_USERS = [
  { id: "1", name: "Alex Johnson", email: "alex@example.com", plan: "PRO", status: "ACTIVE", joined: "Oct 12, 2023", docs: 24 },
  { id: "2", name: "Sarah Miller", email: "sarah.m@gmail.com", plan: "FREE", status: "ACTIVE", joined: "Oct 10, 2023", docs: 3 },
  { id: "3", name: "Michael Chen", email: "mchen@uni.edu", plan: "STARTER", status: "BANNED", joined: "Sep 28, 2023", docs: 12 },
  { id: "4", name: "Elena Rodriguez", email: "elena.r@agency.com", plan: "ENTERPRISE", status: "ACTIVE", joined: "Aug 15, 2023", docs: 156 },
  { id: "5", name: "David Kim", email: "dkim@tech.co", plan: "PRO", status: "PENDING", joined: "Oct 14, 2023", docs: 0 },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">User Management</h2>
          <p className="text-zinc-500 font-bold mt-1 uppercase text-xs tracking-widest">Manage 1,284 users across all tiers</p>
        </div>
        <Button className="gap-2 bg-zinc-900 shadow-xl shadow-zinc-200" size="lg">
          <UserPlus size={20} />
          Add Manual User
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all font-bold"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-5 py-3 text-xs font-black uppercase text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-3 text-xs font-black uppercase text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all">
            <ArrowUpDown size={16} />
            Sort
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">User Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Subscription</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Doc Count</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-zinc-900">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase mt-0.5">
                          <Mail size={10} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight",
                      user.plan === 'ENTERPRISE' ? "bg-purple-100 text-purple-700" : 
                      user.plan === 'PRO' ? "bg-brand-100 text-brand-700" : 
                      "bg-zinc-100 text-zinc-500"
                    )}>
                      {user.plan}
                    </span>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">Joined {user.joined}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       {user.status === 'ACTIVE' ? (
                         <CheckCircle2 size={14} className="text-emerald-500" />
                       ) : user.status === 'BANNED' ? (
                         <XCircle size={14} className="text-red-500" />
                       ) : (
                         <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-200 border-t-zinc-400 animate-spin" />
                       )}
                       <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-zinc-900">{user.docs}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Documents</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
