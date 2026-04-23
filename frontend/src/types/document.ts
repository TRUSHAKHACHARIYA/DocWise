// Types for documents

export type DocStatus = "PROCESSING" | "READY" | "FAILED";

export interface Document {
  id: string;
  userId: string;
  name: string;
  s3Key: string;
  sizeBytes: number;
  mimeType: string;
  chunkCount: number;
  pageCount: number;
  status: DocStatus;
  detailedStatus?: string;
  progress: number;
  errorReason?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UIDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  status: DocStatus;
  uploadedAt: string;
  detailedStatus?: string;
  progress?: number;
  errorReason?: string;
  retryCount?: number;
}

export interface DocumentUploadResponse {
  document: Document;
  uploadUrl?: string; // presigned URL for direct upload
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}
