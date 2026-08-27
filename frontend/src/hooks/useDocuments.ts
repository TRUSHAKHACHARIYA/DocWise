import { useEffect, useRef } from "react";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "@/store/toastStore";
import api from "@/lib/api";
import { SAMPLE_DOCUMENTS, fetchSampleFile } from "@/lib/onboarding";

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

  const loadDocuments = async (showLoading = true, options?: { folderId?: string; unfiled?: boolean }) => {
    if (showLoading) setLoading(true);
    try {
      const response = await api.get("/documents", {
        params: {
          ...(options?.folderId ? { folderId: options.folderId } : {}),
          ...(options?.unfiled ? { unfiled: "true" } : {}),
        },
      });
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
      
      const response = await api.post("/documents/upload", formData, {
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
      const response = await api.post("/documents/ingest-url", { url });
      addDocument(response.data.document);
      toast.success("URL added", "The website content is now processing.");
    } catch (error: any) {
      toast.error("Ingestion failed", error.response?.data?.error || "Could not ingest URL content.");
      throw error;
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      await api.delete(`/documents/${id}`);
      removeDocument(id);
      toast.success("Deleted", "Document removed successfully.");
    } catch (error: any) {
      toast.error("Delete failed", error.response?.data?.error || "Could not delete document.");
    }
  };

  const deleteBulk = async (ids: string[]): Promise<void> => {
    try {
      await api.post("/documents/bulk-delete", { ids });
      ids.forEach(id => removeDocument(id));
      toast.success("Batch Deleted", `${ids.length} documents removed successfully.`);
    } catch (error: any) {
      toast.error("Bulk delete failed", error.response?.data?.error || "Could not clear documents.");
    }
  };

  const loadSampleDocuments = async (): Promise<string[]> => {
    const uploadedIds: string[] = [];

    try {
      for (const sample of SAMPLE_DOCUMENTS) {
        const file = await fetchSampleFile(sample);
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/documents/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        addDocument(response.data.document);
        uploadedIds.push(response.data.document.id);
      }

      toast.success(
        "Sample library loaded",
        "Demo MSA and security policy are processing — pick a suggested prompt when ready."
      );

      return uploadedIds;
    } catch (error: any) {
      toast.error("Sample load failed", error.response?.data?.error || "Could not load sample documents.");
      throw error;
    }
  };

  const moveDocumentToFolder = async (documentId: string, folderId: string | null, reloadOptions?: { folderId?: string; unfiled?: boolean }) => {
    try {
      await api.patch(`/documents/${documentId}/folder`, { folderId });
      toast.success("Moved", folderId ? "Document moved to folder." : "Document removed from folder.");
      await loadDocuments(false, reloadOptions);
    } catch (error: any) {
      toast.error("Move failed", error.response?.data?.error || "Could not move document.");
    }
  };

  const moveDocumentsToFolder = async (documentIds: string[], folderId: string | null, reloadOptions?: { folderId?: string; unfiled?: boolean }) => {
    try {
      await Promise.all(documentIds.map((id) => api.patch(`/documents/${id}/folder`, { folderId })));
      toast.success("Moved", `${documentIds.length} document(s) updated.`);
      await loadDocuments(false, reloadOptions);
    } catch (error: any) {
      toast.error("Move failed", error.response?.data?.error || "Could not move documents.");
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
    loadSampleDocuments,
    moveDocumentToFolder,
    moveDocumentsToFolder,
  };
}
