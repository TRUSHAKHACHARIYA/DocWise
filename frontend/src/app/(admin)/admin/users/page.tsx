"use client";
import { useEffect, useState } from "react";
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  XSquare,
  Trash2,
  Lock,
  Zap,
  Shield
} from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminUsersPage() {
  const { users, totalUsers, isLoading, fetchUsers, updateUser, deleteUser } = useAdmin();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search, page);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">User Management</h2>
          <p className="text-zinc-500 font-bold mt-1 uppercase text-xs tracking-widest">
            Manage {totalUsers.toLocaleString()} users across all tiers
          </p>
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
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Role</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Usage</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-400 animate-pulse font-bold uppercase tracking-widest">
                    Synchronizing User Database...
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-bold text-sm">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-zinc-900 truncate">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase mt-0.5 truncate">
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
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       {user.role === 'ADMIN' ? (
                         <Shield size={14} className="text-brand-600" />
                       ) : (
                         <div className="w-3.5 h-3.5 rounded-full bg-zinc-200" />
                       )}
                       <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-zinc-900">{user.docCount}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">{user.chatCount} Sessions</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => updateUser(user.id, { plan: user.plan === 'PRO' ? 'FREE' : 'PRO' })}
                        className="p-2 text-zinc-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                        title="Toggle Pro Plan"
                      >
                        <Zap size={18} />
                      </button>
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
