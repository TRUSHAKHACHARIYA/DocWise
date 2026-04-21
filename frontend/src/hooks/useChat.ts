import { useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { toast } from "@/store/toastStore";
import type { Message, ChatSession } from "@/types/chat";
import api from "@/lib/api";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api";

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

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch all sessions from backend
  const fetchSessions = async () => {
    try {
      const response = await api.get("/chat");
      setSessions(response.data.sessions);
    } catch (err) {
      toast.error("Error", "Failed to load chat history.");
    }
  };

  // Fetch messages for a session
  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const response = await api.get(`/chat/${sessionId}`);
      setMessages(response.data.session.messages);
    } catch (err) {
      toast.error("Error", "Failed to load messages.");
    }
  };

  // Create a new chat session
  const createSession = async (title = "New Chat", documentIds: string[] = []): Promise<ChatSession> => {
    try {
      const response = await api.post("/chat", { title, documentIds });
      const newSession = response.data.session;
      addSession(newSession);
      setActiveSession(newSession.id);
      clearMessages();
      return newSession;
    } catch (err) {
      toast.error("Error", "Failed to create new chat.");
      throw err;
    }
  };

  // Delete a session
  const deleteSession = async (sessionId: string) => {
    try {
      await api.delete(`/chat/${sessionId}`);
      removeSession(sessionId);
      if (activeSessionId === sessionId) {
        clearMessages();
      }
      toast.success("Success", "Chat deleted.");
    } catch (err) {
      toast.error("Error", "Failed to delete chat.");
    }
  };

  // Update documents for current session
  const updateSessionDocuments = async (sessionId: string, documentIds: string[]) => {
    try {
      await api.patch(`/chat/${sessionId}/documents`, { documentIds });
      toast.success("Updated", "Documents for this session have been updated.");
    } catch (err) {
      toast.error("Error", "Failed to update documents selection.");
    }
  };

  /**
   * Send a message and handle SSE streaming using fetch and ReadableStream
   */
  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || isStreaming || !activeSessionId) return;

    // Add user message to state immediately for responsiveness
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sessionId: activeSessionId,
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
      tokensUsed: 0
    };
    addMessage(userMessage);

    setStreaming(true);
    setError(null);

    // Initial placeholder for AI response
    const aiMessageId = `ai_${Date.now()}`;
    const aiPlaceholder: Message = {
      id: aiMessageId,
      sessionId: activeSessionId,
      role: "ASSISTANT",
      content: "",
      createdAt: new Date().toISOString(),
      tokensUsed: 0,
      sources: []
    };
    addMessage(aiPlaceholder);

    abortControllerRef.current = new AbortController();
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API_URL}/chat/${activeSessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.replace("data: ", "");
          
          if (dataStr === "[DONE]") {
            setStreaming(false);
            continue;
          }

          try {
            const data = JSON.parse(dataStr);
            if (data.text) {
              appendStreamingToken(data.text);
            }
            if (data.sources) {
              // Update the assistant message with sources once they arrive (usually first line)
              setMessages(useChatStore.getState().messages.map(m => 
                m.id === aiMessageId ? { ...m, sources: data.sources } : m
              ));
            }
            if (data.error) {
              throw new Error(data.error);
            }
          } catch (e) {
            console.error("Error parsing SSE data", e);
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      
      setError(err.message || "Failed to get a response.");
      toast.error("Chat error", err.message || "Something went wrong.");
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const cancelStream = () => {
    abortControllerRef.current?.abort();
    setStreaming(false);
  };

  const submitMessageFeedback = async (messageId: string, isPositive: boolean, comment?: string) => {
    if (!activeSessionId) return;
    try {
      await api.post(`/chat/${activeSessionId}/messages/${messageId}/feedback`, { isPositive, comment });
      toast.success(isPositive ? "Helpful" : "Feedback recorded", "Thank you for helping improve DocWise.");
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  return {
    sessions,
    activeSessionId,
    messages,
    isStreaming,
    error,
    fetchSessions,
    fetchSessionMessages,
    createSession,
    deleteSession,
    updateSessionDocuments,
    sendMessage,
    submitMessageFeedback,
    cancelStream,
    setActiveSession,
    clearMessages,
  };
}
