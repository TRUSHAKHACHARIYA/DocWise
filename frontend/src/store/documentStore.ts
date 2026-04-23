import { create } from "zustand";
import type { Document, DocStatus, UIDocument } from "@/types/document";
import api from "@/lib/api";
import { toast } from "./toastStore";

interface DocumentStore {
  documents: UIDocument[];
  isLoading: boolean;
  error: string | null;

  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  updateDocumentStatus: (id: string, status: DocStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  isLoading: false,
  error: null,

  setDocuments: (docs) => 
    set({ 
      documents: docs.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.mimeType.split('/').pop()?.toUpperCase() || 'FILE',
        size: formatSize(d.sizeBytes),
        status: d.status,
        uploadedAt: new Date(d.createdAt).toLocaleDateString(),
        detailedStatus: d.detailedStatus,
        progress: d.progress,
        errorReason: d.errorReason,
        retryCount: d.retryCount,
      }))
    }),

  addDocument: (d) => 
    set((state) => ({ 
      documents: [{
        id: d.id,
        name: d.name,
        type: d.mimeType.split('/').pop()?.toUpperCase() || 'FILE',
        size: formatSize(d.sizeBytes),
        status: d.status,
        uploadedAt: new Date(d.createdAt).toLocaleDateString(),
        detailedStatus: d.detailedStatus,
        progress: d.progress,
        errorReason: d.errorReason,
        retryCount: d.retryCount,
      }, ...state.documents] 
    })),

  removeDocument: (id) =>
    set((state) => ({ 
      documents: state.documents.filter((d) => d.id !== id) 
    })),

  updateDocumentStatus: (id, status) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, status } : d
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
