import { useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { toast } from "@/store/toastStore";
import type { Message, ChatSession } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useChat() {
  const {
    sessions,
    activeSessionId,
    messages,
    isStreaming,
    error,
    setSessions,
    addSession,
    removeSession,
    setActiveSession,
    setMessages,
    addMessage,
    appendStreamingToken,
    setStreaming,
    setError,
    clearMessages,
  } = useChatStore();

  const eventSourceRef = useRef<EventSource | null>(null);

  // Create a new chat session — replace POST /chat/sessions in Day 18
  const createSession = async (title = "New Chat"): Promise<ChatSession> => {
    const session: ChatSession = {
      id: `sess_${Date.now()}`,
      userId: "usr_mock_123",
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addSession(session);
    setActiveSession(session.id);
    clearMessages();
    return session;
  };

  // Delete a session
  const deleteSession = async (sessionId: string) => {
    removeSession(sessionId);
    if (activeSessionId === sessionId) {
      clearMessages();
    }
  };

  /**
   * Send a message and simulate SSE streaming.
   * In Week 3 Day 19, replace with real EventSource to POST /chat/sessions/:id/message
   */
  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || isStreaming) return;

    // Add user message to store
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      sessionId: activeSessionId || "default",
      role: "USER",
      content,
      tokensUsed: 0,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);
    setStreaming(true);
    setError(null);

    try {
      // Create empty AI message placeholder for streaming
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        sessionId: activeSessionId || "default",
        role: "ASSISTANT",
        content: "",
        tokensUsed: 0,
        createdAt: new Date().toISOString(),
        sources: [],
      };
      addMessage(aiMessage);

      // Mock SSE streaming — stream tokens one by one
      const mockResponse =
        "Based on the documents you've uploaded, I can see that the annual report shows a strong growth trajectory. The EBITDA margin improved by 2.4% year-over-year, primarily driven by operational cost efficiencies in Q3. The legal contract contains standard indemnification clauses in sections 8 through 12 that you should review with your counsel.";

      const words = mockResponse.split(" ");
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        appendStreamingToken((i === 0 ? "" : " ") + words[i]);
      }

      // Add mock sources after streaming completes
      const finalMessage: Message = {
        ...aiMessage,
        content: mockResponse,
        sources: [
          { chunkId: "chunk_1", text: "EBITDA margin improved by 2.4%...", page: 12, score: 0.94, docName: "Annual Report 2023.pdf" },
          { chunkId: "chunk_2", text: "Standard indemnification clauses...", page: 8, score: 0.87, docName: "Project Requirements.docx" },
        ],
        tokensUsed: 186,
      };

      // Update last message with sources via store
      setMessages([
        ...useChatStore.getState().messages.slice(0, -1),
        finalMessage
      ]);
    } catch (err) {
      setError("Failed to get a response. Please try again.");
      toast.error("Chat error", "Could not reach the AI. Please try again.");
    } finally {
      setStreaming(false);
    }
  };

  // Cancel ongoing SSE stream
  const cancelStream = () => {
    eventSourceRef.current?.close();
    setStreaming(false);
  };

  return {
    sessions,
    activeSessionId,
    messages,
    isStreaming,
    error,
    createSession,
    deleteSession,
    sendMessage,
    cancelStream,
    setActiveSession,
    clearMessages,
  };
}
