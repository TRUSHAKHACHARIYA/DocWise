import { useEffect, useRef } from "react";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "@/store/toastStore";
import api from "@/lib/api";

export function useDocuments() {
  const {
    documents,
    isLoading,
    error,
    setDocuments,
    addDocument,
    removeDocument,
    setLoading,
    setError,
  } = useDocumentStore();

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadDocuments = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await api.get("/api/documents");
      setDocuments(response.data.documents);
    } catch (err) {
      setError("Failed to load documents.");
      toast.error("Error", "Could not load your documents.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Setup polling if any document is processing
  useEffect(() => {
    const isProcessing = documents.some(doc => doc.status === 'PROCESSING');
    
    if (isProcessing && !pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        loadDocuments(false); // Silent reload
      }, 5000);
    } else if (!isProcessing && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [documents]);

  const uploadDocument = async (file: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
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

  const ingestUrl = async (url: string): Promise<void> => {
    try {
      const response = await api.post("/api/documents/ingest-url", { url });
      addDocument(response.data.document);
      toast.success("URL added", "The website content is now processing.");
    } catch (error: any) {
      toast.error("Ingestion failed", error.response?.data?.error || "Could not ingest URL content.");
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

  const deleteBulk = async (ids: string[]): Promise<void> => {
    try {
      await api.post("/api/documents/bulk-delete", { ids });
      ids.forEach(id => removeDocument(id));
      toast.success("Batch Deleted", `${ids.length} documents removed successfully.`);
    } catch (error: any) {
      toast.error("Bulk delete failed", error.response?.data?.error || "Could not clear documents.");
    }
  };

  return {
    documents,
    isLoading,
    error,
    loadDocuments,
    uploadDocument,
    ingestUrl,
    deleteDocument,
    deleteBulk,
  };
}
