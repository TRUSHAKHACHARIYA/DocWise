import { create } from "zustand";
import type { Document, DocStatus } from "@/types/document";

interface DocumentStore {
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  // Actions (mock data for Week 1 — wired to real API in Day 11)
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  updateDocumentStatus: (id: string, status: DocStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  isLoading: false,
  error: null,

  setDocuments: (documents) => set({ documents }),

  addDocument: (doc) =>
    set((state) => ({ documents: [doc, ...state.documents] })),

  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
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
