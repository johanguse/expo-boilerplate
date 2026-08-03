import { ApiError, ApiErrorCode } from "@api/client";
import { API_V1 } from "@config/api";
import { StorageKeys, storage } from "@lib/storage";

/**
 * Async generator that streams text chunks from the backend chat endpoint.
 *
 * The backend passes Workers AI's Server-Sent Events through untouched, so the
 * body is a sequence of `data: {"response":"…"}` frames terminated by
 * `data: [DONE]`. Frames can be split across reads, so a buffer is carried
 * between chunks and only complete `\n\n`-delimited events are parsed.
 *
 * Requires React Native new architecture (enabled in app.json: newArchEnabled: true).
 */
export async function* streamFetch(
  path: string,
  body: unknown,
): AsyncGenerator<string, void, unknown> {
  const token = storage.getString(StorageKeys.ACCESS_TOKEN);

  const response = await fetch(`${API_V1}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    // Hint for React Native streaming support
    // @ts-expect-error - RN fetch extension for streaming
    reactNative: { textStreaming: true },
  });

  if (response.status === 401) {
    throw new ApiError(
      401,
      "Session expired. Please sign in again.",
      ApiErrorCode.Unauthorized,
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let code = "UNKNOWN";
    try {
      const data = (await response.json()) as {
        error?: { code?: string; message?: string };
      };
      if (data?.error?.message) message = data.error.message;
      if (data?.error?.code) code = data.error.code;
    } catch {
      // Non-JSON error body — keep the status-based message.
    }
    throw new ApiError(response.status, message, code);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming not supported in this environment");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Events are separated by a blank line; the trailing segment may be partial.
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const chunk = parseSseEvent(event);
        if (chunk === DONE) return;
        if (chunk) yield chunk;
      }
    }

    const trailing = parseSseEvent(buffer);
    if (trailing && trailing !== DONE) yield trailing;
  } finally {
    reader.releaseLock();
  }
}

const DONE = Symbol("done");

/**
 * Pull the text out of one SSE event, or `DONE` at end of stream.
 *
 * Workers AI sends `{"response":"…"}`; OpenAI-compatible models send
 * `{"choices":[{"delta":{"content":"…"}}]}`. Both are accepted so changing
 * `AI_MODEL` on the backend doesn't break the client.
 */
function parseSseEvent(event: string): string | typeof DONE | null {
  const data = event
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("");

  if (!data) return null;
  if (data === "[DONE]") return DONE;

  try {
    const parsed = JSON.parse(data) as {
      response?: string;
      choices?: { delta?: { content?: string } }[];
    };
    return parsed.response ?? parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    // Not JSON — treat the payload as raw text.
    return data;
  }
}
