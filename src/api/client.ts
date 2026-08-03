import { API_V1 } from "@config/api";
import { StorageKeys, storage } from "@lib/storage";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  headers?: Record<string, string>;
  /** If true, skip the Authorization header */
  noAuth?: boolean;
  /**
   * If true, a 401 neither refreshes the token nor triggers sign-out — it just
   * throws. Needed for calls made *during* sign-out, which would otherwise
   * recurse back into it.
   */
  skipSessionRecovery?: boolean;
  /** If provided, send as form-urlencoded instead of JSON */
  formData?: URLSearchParams;
}

/**
 * A failed API call.
 *
 * The backend returns `{ error: { code, message } }` where `message` is already
 * user-facing English (see `lib/messages.ts` there), so it's shown as-is rather
 * than remapped here. `code` is the stable identifier to branch on — it does
 * not change when the wording does.
 */
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code = "UNKNOWN") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Error codes worth branching on, rather than just displaying. */
export const ApiErrorCode = {
  EmailNotVerified: "EMAIL_NOT_VERIFIED",
  InvalidCredentials: "INVALID_EMAIL_OR_PASSWORD",
  EmailAlreadyExists: "USER_ALREADY_EXISTS",
  Unauthorized: "UNAUTHORIZED",
  RateLimited: "RATE_LIMIT_EXCEEDED",
  ValidationError: "VALIDATION_ERROR",
} as const;

/** Longest server message we're willing to render in a toast. */
const MAX_DISPLAY_MESSAGE_LENGTH = 120;

/** Developer-facing noise: JSON blobs, stack frames, native error domains. */
const NOISY_MESSAGE = /^[[{]|Error Domain=|\bat\s+\S+:\d+:\d+/;

/**
 * Pick a message safe to show a user.
 *
 * Server `detail` strings are unbounded and often developer-facing — a stack
 * trace or serialized error dumped into a toast is unreadable. Anything long
 * or noisy is dropped in favour of `fallback`; the original still reaches the
 * console for debugging.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  const message = raw.trim().replace(/\s+/g, " ");

  if (
    !message ||
    message.length > MAX_DISPLAY_MESSAGE_LENGTH ||
    NOISY_MESSAGE.test(message)
  ) {
    if (message && typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn("[api] suppressed error message in UI:", message);
    }
    return fallback;
  }

  return message;
}

// ---------------------------------------------------------------------------
// Session callbacks — set by the auth store to avoid circular imports
// ---------------------------------------------------------------------------
let _onUnauthorized: (() => void) | null = null;
let _refreshSession: (() => Promise<boolean>) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  _onUnauthorized = handler;
}

/**
 * Register how to mint a fresh access token. Resolves `true` when a new token
 * has been written to storage, `false` when the session is unrecoverable.
 */
export function setRefreshHandler(handler: () => Promise<boolean>): void {
  _refreshSession = handler;
}

/**
 * In-flight refresh, shared so a burst of concurrent 401s triggers one refresh
 * rather than one per request (which would invalidate each other's tokens).
 */
let _refreshInFlight: Promise<boolean> | null = null;

function refreshOnce(): Promise<boolean> {
  if (!_refreshSession) return Promise.resolve(false);
  if (!_refreshInFlight) {
    _refreshInFlight = _refreshSession().finally(() => {
      _refreshInFlight = null;
    });
  }
  return _refreshInFlight;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------
async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: RequestOptions,
  /** Internal: set when replaying a request after a token refresh. */
  isRetry = false,
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_V1}${path}`;

  const headers: Record<string, string> = {
    ...(options?.headers ?? {}),
  };

  if (!options?.noAuth) {
    const token = storage.getString(StorageKeys.ACCESS_TOKEN);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let fetchBody: BodyInit | undefined;

  if (options?.formData) {
    // React Native fetch doesn't auto-serialize URLSearchParams — must call .toString()
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    fetchBody = options.formData.toString();
  } else if (body instanceof FormData) {
    // Let fetch set the multipart boundary itself.
    fetchBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  const response = await fetch(url, {
    method,
    headers,
    body: fetchBody,
  });

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // 401 Unauthorized → refresh the 15-minute access token and replay once.
  // A FormData body can't be safely replayed (the stream is consumed), so those
  // fall through to sign-out instead.
  if (
    response.status === 401 &&
    !options?.noAuth &&
    !options?.skipSessionRecovery
  ) {
    if (!isRetry && !(body instanceof FormData) && (await refreshOnce())) {
      return request<T>(method, path, body, options, true);
    }
    _onUnauthorized?.();
    throw new ApiError(
      401,
      "Session expired. Please sign in again.",
      ApiErrorCode.Unauthorized,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw toApiError(response.status, data);
  }

  return unwrapEnvelope(data) as T;
}

/**
 * The backend wraps every success in `{ data: … }`. Unwrap it so call sites see
 * the payload directly; anything unwrapped (or a bare value) passes through.
 */
function unwrapEnvelope(data: unknown): unknown {
  if (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    "data" in data
  ) {
    return (data as { data: unknown }).data;
  }
  return data;
}

/** Build an ApiError from a `{ error: { code, message } }` body. */
function toApiError(status: number, data: unknown): ApiError {
  const error = (data as { error?: { code?: unknown; message?: unknown } })
    ?.error;

  if (typeof error?.message === "string" && error.message.length > 0) {
    return new ApiError(
      status,
      error.message,
      typeof error.code === "string" ? error.code : "UNKNOWN",
    );
  }

  if (typeof data === "string" && data.length > 0) {
    return new ApiError(status, data);
  }

  return new ApiError(status, `Request failed (${status})`);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
