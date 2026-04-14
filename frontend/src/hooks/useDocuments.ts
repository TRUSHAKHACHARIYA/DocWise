import { useDocumentStore } from "@/store/documentStore";
import { toast } from "@/store/toastStore";
import api from "@/lib/api";
import type { Document } from "@/types/document";

export function useDocuments() {
  const {
    documents,
    isLoading,
    error,
    setDocuments,
    addDocument,
    removeDocument,
    updateDocumentStatus,
    setLoading,
    setError,
  } = useDocumentStore();

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/documents");
      setDocuments(response.data.documents);
    } catch (err) {
      setError("Failed to load documents.");
      toast.error("Error", "Could not load your documents.");
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Optimistically show uploading status, handle later
      const tempId = `temp_${Date.now()}`;
      
      const response = await api.post("/api/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      addDocument(response.data.document);
      toast.success("Document uploaded", `"${file.name}" is now processing.`);
    } catch (error: any) {
      toast.error("Upload failed", error.response?.data?.error || "Could not upload document.");
      throw error;
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/documents/${id}`);
      removeDocument(id);
      toast.success("Deleted", "Document removed successfully.");
    } catch (error: any) {
      toast.error("Delete failed", error.response?.data?.error || "Could not delete document.");
    }
  };

  return {
    documents,
    isLoading,
    error,
    loadDocuments,
    uploadDocument,
    deleteDocument,
  };
}
