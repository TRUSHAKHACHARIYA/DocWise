import type {
  DocWiseConfig,
  Document,
  ListDocumentsResponse,
  RetrieveParams,
  RetrieveResponse,
  UploadResponse,
} from "./types.js";
import { DocWiseError } from "./types.js";

export class DocWise {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: DocWiseConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "https://api.docwise.ai").replace(
      /\/$/,
      "",
    );
  }

  private async request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...init?.headers,
      },
    });

    const body = await res.text();
    if (!res.ok) {
      let message: string;
      try {
        message = JSON.parse(body).error || body;
      } catch {
        message = body;
      }
      throw new DocWiseError(res.status, message);
    }

    return JSON.parse(body) as T;
  }

  async retrieve(params: RetrieveParams): Promise<RetrieveResponse> {
    return this.request<RetrieveResponse>("/api/v1/retrieve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  }

  async uploadDocument(
    file: Buffer | Blob | ArrayBuffer,
    name: string,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    const blob =
      file instanceof Blob
        ? file
        : new Blob([file instanceof ArrayBuffer ? file : new Uint8Array(file)]);
    formData.append("file", blob, name);

    const res = await fetch(`${this.baseUrl}/api/v1/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: formData,
    });

    const body = await res.text();
    if (!res.ok) {
      let message: string;
      try {
        message = JSON.parse(body).error || body;
      } catch {
        message = body;
      }
      throw new DocWiseError(res.status, message);
    }

    return JSON.parse(body) as UploadResponse;
  }

  async listDocuments(): Promise<ListDocumentsResponse> {
    return this.request<ListDocumentsResponse>("/api/v1/documents");
  }

  async deleteDocument(id: string): Promise<{ message: string }> {
    return this.request(`/api/v1/documents/${id}`, {
      method: "DELETE",
    });
  }
}
