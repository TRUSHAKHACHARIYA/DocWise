"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  ShieldCheck, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Terminal, 
  Info,
  Calendar,
  User,
  Activity,
  Globe,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

export default function AuditLogsPage() {
  const { logs, totalLogs, fetchLogs, isLoading } = useAdmin();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(search, page);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const totalPages = Math.ceil(totalLogs / itemsPerPage);

  const getActionColor = (action: string) => {
    if (action.includes("DELETE") || action.includes("BAN") || action.includes("REVOKE")) return "rose";
    if (action.includes("CREATE") || action.includes("UPLOAD") || action.includes("SIGNUP")) return "brand";
    if (action.includes("UPDATE") || action.includes("PLAN_CHANGE")) return "purple";
    return "slate";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 shadow-inner">
             <ShieldCheck size={28} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tight leading-none mb-2">Audit Logs</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Immutable security & action tracking</p>
           </div>
        </div>
        
        <div className="w-full md:w-80">
          <Input 
            placeholder="Filter by action or actor..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={<Search size={18} />}
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Event</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Actor</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Action</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-8 h-8 rounded-lg flex items-center justify-center border",
                         log.action.includes("BAN") || log.action.includes("DELETE") ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                       )}>
                          <Activity size={14} />
                       </div>
                       <span className="text-xs font-bold text-zinc-900">{log.targetType || "System"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-zinc-400" />
                      <span className="text-xs font-mono text-zinc-500 truncate max-w-[120px]">{log.actorId || "System"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge variant={getActionColor(log.action) as any}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 max-w-xs">
                       <p className="text-[11px] font-medium text-zinc-500 truncate italic">
                         {JSON.stringify(log.metadata)}
                       </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Globe size={10} />
                        <span className="text-[10px] font-mono">{log.ipAddress || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Monitor size={10} />
                        <span className="text-[9px] truncate max-w-[100px]">{log.userAgent || "Unknown"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold uppercase tabular-nums">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && logs.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center">
                     <Terminal size={40} className="mx-auto text-zinc-200 mb-4" />
                     <p className="text-xs font-black uppercase text-zinc-400 tracking-widest italic">No events recorded in this scope.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-zinc-50/30 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Showing <span className="text-zinc-900">{(page - 1) * itemsPerPage + 1}</span> - <span className="text-zinc-900">{Math.min(page * itemsPerPage, totalLogs)}</span> of {totalLogs} events
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 disabled:opacity-50 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 disabled:opacity-50 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
