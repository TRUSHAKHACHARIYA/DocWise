import { create } from "zustand";
import type { Document, DocStatus } from "@/types/document";
import api from "@/lib/api";
import { toast } from "./toastStore";

interface DocumentStore {
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  fetchDocuments: () => Promise<void>;
  uploadDocuments: (files: File[]) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setDocuments: (docs: Document[]) => void;
  updateDocumentStatus: (id: string, status: DocStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/documents");
      if (res.data && res.data.documents) {
        // map backend Document model to frontend type if needed (status is already string)
        const mappedDocs = res.data.documents.map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          size: d.size, // in bytes potentially, let's just pass through
          url: d.url,
          status: d.status,
          uploadedAt: d.createdAt, // Or process it
        }));
        set({ documents: mappedDocs });
      }
    } catch (error: any) {
      set({ error: error.message });
      toast.error("Failed to load documents", error.message);
    } finally {
      set({ isLoading: false });
    }
  },

  uploadDocuments: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    
    try {
      const res = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      // The backend returns { documents: [...] }
      if (res.data && res.data.documents) {
        const mapped = res.data.documents.map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          size: d.size,
          url: d.url,
          status: d.status,
          uploadedAt: d.createdAt,
        }));
        set(state => ({ documents: [...mapped, ...state.documents] }));
        toast.success("Upload started", `Processing ${files.length} document(s)`);
      }
    } catch (error: any) {
      toast.error("Upload failed", error.response?.data?.error || error.message);
      throw error;
    }
  },

  deleteDocument: async (id: string) => {
    try {
      await api.delete(`/documents/${id}`);
      set(state => ({ documents: state.documents.filter(d => d.id !== id) }));
      toast.success("Document deleted", "Successfully removed from your account.");
    } catch (error: any) {
      toast.error("Delete failed", error.message);
      throw error;
    }
  },

  setDocuments: (documents) => set({ documents }),

  updateDocumentStatus: (id, status) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, status } : d
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
