import { API_V1 } from "@config/api";
import { storage, StorageKeys } from "@utils/storage";
import { ApiError } from "./api/client";

/**
 * Async generator that streams plain-text chunks from the backend chat endpoint.
 *
 * The backend returns `media_type="text/plain"` chunks — not SSE events — so we
 * read the response body directly with a ReadableStream reader.
 *
 * Requires React Native new architecture (enabled in app.json: newArchEnabled: true).
 */
export async function* streamFetch(
  path: string,
  body: unknown
): AsyncGenerator<string, void, unknown> {
  const token = storage.getString(StorageKeys.ACCESS_TOKEN);

  const response = await fetch(`${API_V1}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    // Hint for React Native streaming support
    // @ts-ignore
    reactNative: { textStreaming: true },
  });

  if (response.status === 401) {
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.detail) detail = data.detail;
    } catch {}
    throw new ApiError(response.status, detail);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming not supported in this environment");
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) yield chunk;
    }
  } finally {
    reader.releaseLock();
  }
}
