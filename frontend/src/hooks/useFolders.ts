import { useState } from "react";
import { toast } from "@/store/toastStore";
import api from "@/lib/api";
import type { Folder } from "@/types/workspace";

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFolders = async (workspaceId?: string) => {
    setIsLoading(true);
    try {
      const response = await api.get("/folders", {
        params: workspaceId ? { workspaceId } : undefined,
      });
      setFolders(response.data.folders);
      return response.data.folders as Folder[];
    } catch {
      toast.error("Error", "Failed to load folders.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async (name: string, workspaceId?: string) => {
    const response = await api.post("/folders", { name, workspaceId });
    const folder = response.data.folder as Folder;
    setFolders((prev) => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)));
    toast.success("Folder created", `"${name}" is ready.`);
    return folder;
  };

  const renameFolder = async (id: string, name: string) => {
    const response = await api.patch(`/folders/${id}`, { name });
    const folder = response.data.folder as Folder;
    setFolders((prev) => prev.map((f) => (f.id === id ? folder : f)));
    return folder;
  };

  const deleteFolder = async (id: string) => {
    await api.delete(`/folders/${id}`);
    setFolders((prev) => prev.filter((f) => f.id !== id));
    toast.success("Folder deleted", "Documents were moved to unfiled.");
  };

  return {
    folders,
    isLoading,
    loadFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    setFolders,
  };
}
