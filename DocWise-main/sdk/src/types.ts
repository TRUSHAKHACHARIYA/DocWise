export type SearchMode = "semantic" | "keyword" | "hybrid";

export interface RetrieveFilters {
  documentId?: string[];
  uploadedAfter?: string;
  uploadedBefore?: string;
}

export interface RetrieveParams {
  query: string;
  documentIds?: string[];
  topK?: number;
  searchMode?: SearchMode;
  recencyBias?: number;
  filters?: RetrieveFilters;
}

export interface ChunkResult {
  text: string;
  score: number;
  documentId: string;
  documentName: string;
  page: number | null;
  metadata: Record<string, unknown>;
}

export interface RetrieveResponse {
  chunks: ChunkResult[];
  query: string;
  retrievedCount: number;
  searchMode: SearchMode;
}

export type DocumentStatus = "PROCESSING" | "READY" | "FAILED";

export interface Document {
  id: string;
  name: string;
  status: DocumentStatus;
  chunkCount: number;
  pageCount: number | null;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  document: Document;
}

export interface ListDocumentsResponse {
  documents: Document[];
}

export interface DocWiseConfig {
  apiKey: string;
  baseUrl?: string;
}

export class DocWiseError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "DocWiseError";
  }
}
