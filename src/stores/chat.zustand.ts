import { type ChatMessage, streamChat } from "@api/ai";
import { create } from "zustand";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

type ChatState = {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;

  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
  setError: (error: string | null) => void;
};

let messageCounter = 0;

function nextId(): string {
  return `msg-${Date.now()}-${++messageCounter}`;
}

const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  error: null,

  sendMessage: async (text: string) => {
    if (!text.trim() || get().isStreaming) return;

    const userMessage: Message = {
      id: nextId(),
      role: "user",
      content: text.trim(),
      createdAt: new Date(),
    };

    const assistantId = nextId();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage, assistantMessage],
      isStreaming: true,
      error: null,
    }));

    // Build the conversation history for the API (excluding the empty assistant placeholder)
    const history: ChatMessage[] = get()
      .messages.slice(0, -1) // exclude the empty assistant message we just added
      .map(({ role, content }) => ({ role, content }));

    try {
      for await (const chunk of streamChat(history)) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m,
          ),
        }));
      }
    } catch (err: unknown) {
      const errorText =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      // Replace the empty assistant message with the error
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === assistantId ? { ...m, content: errorText } : m,
        ),
        error: errorText,
      }));
    } finally {
      set({ isStreaming: false });
    }
  },

  clearHistory: () => set({ messages: [], error: null }),

  setError: (error) => set({ error }),
}));

export default useChatStore;
