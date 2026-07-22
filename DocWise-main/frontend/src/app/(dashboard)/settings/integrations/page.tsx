"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Cloud, RefreshCw, Trash2, CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { toast } from "@/store/toastStore";
import api from "@/lib/api";

interface Integration {
  id: string;
  provider: string;
  providerUserId: string | null;
  createdAt: string;
  updatedAt: string;
  syncJobs: {
    status: string;
    completedAt: string | null;
    filesProcessed: number;
  }[];
}

export default function IntegrationsPage() {
  const searchParams = useSearchParams();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
    if (searchParams.get("connected") === "true") {
      toast.success("Connected", "Google Drive has been connected successfully.");
    }
    if (searchParams.get("error")) {
      toast.error("Connection Failed", "Could not connect to Google Drive. Please try again.");
    }
  }, [searchParams]);

  const fetchIntegrations = async () => {
    try {
      const response = await api.get("/integrations");
      setIntegrations(response.data.integrations);
    } catch (err) {
      toast.error("Error", "Failed to load integrations.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await api.get("/integrations/google-drive/auth");
      window.location.href = response.data.url;
    } catch (err) {
      toast.error("Error", "Failed to start Google Drive connection.");
    }
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      const response = await api.post(`/integrations/${id}/sync`);
      const { filesFound, filesProcessed } = response.data;
      toast.success("Sync Complete", `Processed ${filesProcessed} of ${filesFound} files.`);
      fetchIntegrations();
    } catch (err: any) {
      toast.error("Sync Failed", err.response?.data?.error || "An error occurred during sync.");
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Disconnect this integration? Previously synced documents will remain.")) return;
    try {
      await api.delete(`/integrations/${id}`);
      toast.success("Disconnected", "Integration has been removed.");
      fetchIntegrations();
    } catch (err) {
      toast.error("Error", "Failed to disconnect integration.");
    }
  };

  const googleDrive = integrations.find(i => i.provider === "GOOGLE_DRIVE");
  const lastSync = googleDrive?.syncJobs?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase">Integrations</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Connect cloud storage to automatically sync and index documents.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-[2rem]" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Google Drive Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shrink-0">
                <Cloud size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Google Drive</h3>
                  {googleDrive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <CheckCircle size={12} />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-lg">
                  Automatically import PDFs and documents from your Google Drive. Sync runs on demand or can be triggered via API.
                </p>

                {googleDrive && lastSync && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <RefreshCw size={12} />
                      Last sync: {lastSync.completedAt
                        ? new Date(lastSync.completedAt).toLocaleString()
                        : "In progress"}
                    </div>
                    {lastSync.status === "completed" && (
                      <p className="text-xs text-slate-400 mt-1">
                        {lastSync.filesProcessed} documents processed
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 flex items-center gap-3">
                  {googleDrive ? (
                    <>
                      <Button
                        onClick={() => handleSync(googleDrive.id)}
                        loading={syncingId === googleDrive.id}
                        className="gap-2 bg-[var(--rust)] text-white hover:bg-[var(--rust-dark)] rounded-xl"
                      >
                        <RefreshCw size={16} />
                        Sync Now
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDisconnect(googleDrive.id)}
                        className="gap-2 text-red-600 border-red-100 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 size={16} />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleConnect}
                      className="gap-2 bg-[var(--rust)] text-white hover:bg-[var(--rust-dark)] rounded-xl"
                    >
                      <ExternalLink size={16} />
                      Connect Google Drive
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder for future integrations */}
          <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-600 rounded-[2rem] p-8 text-center">
            <p className="text-sm font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest">
              More integrations coming soon
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Dropbox, OneDrive, and direct URL sync are on the roadmap.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
