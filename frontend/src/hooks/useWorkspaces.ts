import { useState } from "react";
import { toast } from "@/store/toastStore";
import api from "@/lib/api";
import type { Workspace } from "@/types/workspace";

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/workspaces");
      setWorkspaces(response.data.workspaces);
      return response.data.workspaces as Workspace[];
    } catch {
      toast.error("Error", "Failed to load workspaces.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (name: string, description?: string) => {
    const response = await api.post("/workspaces", { name, description });
    const workspace = response.data.workspace as Workspace;
    setWorkspaces((prev) => [workspace, ...prev]);
    toast.success("Workspace created", `"${name}" is ready.`);
    return workspace;
  };

  const updateWorkspace = async (id: string, data: { name?: string; description?: string | null }) => {
    const response = await api.patch(`/workspaces/${id}`, data);
    const workspace = response.data.workspace as Workspace;
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? workspace : w)));
    return workspace;
  };

  const deleteWorkspace = async (id: string) => {
    await api.delete(`/workspaces/${id}`);
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    toast.success("Workspace deleted", "Folders were unlinked, not deleted.");
  };

  return {
    workspaces,
    isLoading,
    loadWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  };
}
