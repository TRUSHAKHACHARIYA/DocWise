// Types for chat sessions and messages

export type MessageRole = "USER" | "ASSISTANT";

export interface MessageSource {
  chunkId: string;
  text: string;
  page?: number;
  score: number;
  docName: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  sources?: MessageSource[];
  confidence?: number;
  tokensUsed: number;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  documentIds?: string[];
}

export interface ChatSessionListResponse {
  sessions: ChatSession[];
  total: number;
}

export interface SendMessageRequest {
  content: string;
  documentIds?: string[];
}
