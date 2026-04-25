import { streamFetch } from "@lib/streamClient";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Stream chat completions from the backend.
 * Yields plain-text chunks as they arrive from the AI model.
 *
 * @example
 * for await (const chunk of streamChat(messages)) {
 *   setResponse(prev => prev + chunk);
 * }
 */
export function streamChat(messages: ChatMessage[]): AsyncGenerator<string> {
  return streamFetch("/chat/stream", { messages });
}
