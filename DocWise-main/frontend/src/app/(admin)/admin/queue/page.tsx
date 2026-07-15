"use client";

import { useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  BarChart3, 
  RotateCcw, 
  AlertCircle, 
  FileText, 
  Clock,
  ExternalLink,
  Search
} from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function AdminQueuePage() {
  const { deadLetterJobs, fetchDeadLetterJobs, retryJob, isLoading } = useAdmin();

  useEffect(() => {
    fetchDeadLetterJobs();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Ingestion Queue</h2>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 italic">
            Monitor and triage failed background document processing jobs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={fetchDeadLetterJobs}
            className="gap-2 rounded-xl"
            disabled={isLoading}
          >
            <RotateCcw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Queue Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dead Letter Jobs</p>
              <h4 className="text-2xl font-black text-zinc-900">{deadLetterJobs.length}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm opacity-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Queue Latency</p>
              <h4 className="text-2xl font-black text-zinc-900">0.4s</h4>
            </div>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm opacity-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center shadow-sm">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Throughput</p>
              <h4 className="text-2xl font-black text-zinc-900">1.2k/hr</h4>
            </div>
          </div>
        </div>
      </div>

      {/* DLQ List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight leading-none">Dead-Letter Triage</h3>
          <span className="text-[10px] font-black px-3 py-1 bg-zinc-900 text-white rounded-full uppercase tracking-widest">
            {deadLetterJobs.length} Failed Tasks
          </span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Job Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Failure Reason</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading && deadLetterJobs.length === 0 ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td colSpan={3} className="px-8 py-10 text-center">
                      <Skeleton className="h-10 w-full rounded-2xl" />
                    </td>
                  </tr>
                ))
              ) : deadLetterJobs.length > 0 ? (
                deadLetterJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-sm border border-zinc-200">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 uppercase tracking-tighter">
                            {job.data?.filename || job.name}
                          </p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                            ID: {job.id.substring(0, 8)}... • {new Date(job.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-md">
                        <p className="text-xs font-black text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl inline-block">
                          {job.failedReason || "Unknown failure"}
                        </p>
                        {job.data?.documentId && (
                           <p className="text-[9px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">
                             DOC_ID: {job.data.documentId}
                           </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => retryJob(job.id)}
                          className="h-9 px-4 rounded-xl gap-2 shadow-lg shadow-zinc-200"
                        >
                          <RotateCcw size={14} />
                          Retry Job
                        </Button>
                        <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-400 flex items-center justify-center">
                        <RotateCcw size={32} />
                      </div>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Queue is clear. No failed tasks found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
