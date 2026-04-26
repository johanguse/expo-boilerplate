import { API_V1 } from "@config/api";
import { StorageKeys, storage } from "@lib/storage";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  headers?: Record<string, string>;
  /** If true, skip the Authorization header */
  noAuth?: boolean;
  /** If provided, send as form-urlencoded instead of JSON */
  formData?: URLSearchParams;
}

// Human-readable messages for fastapi-users error codes
const FRIENDLY_ERRORS: Record<string, string> = {
  LOGIN_BAD_CREDENTIALS: "Invalid email or password.",
  LOGIN_USER_NOT_VERIFIED: "Please verify your email before signing in.",
  REGISTER_USER_ALREADY_EXISTS: "An account with this email already exists.",
  RESET_PASSWORD_BAD_TOKEN: "This reset link is invalid or has expired.",
  RESET_PASSWORD_INVALID_PASSWORD: "New password does not meet requirements.",
  VERIFY_USER_ALREADY_VERIFIED: "Your email is already verified.",
  VERIFY_USER_BAD_TOKEN: "This verification link is invalid or has expired.",
  UPDATE_USER_EMAIL_ALREADY_EXISTS: "This email is already in use.",
  UPDATE_USER_INVALID_PASSWORD: "Current password is incorrect.",
};

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    const friendly = FRIENDLY_ERRORS[detail] ?? detail;
    super(friendly);
    this.name = "ApiError";
    this.status = status;
    this.detail = friendly;
  }
}

// ---------------------------------------------------------------------------
// Unauthorized callback — set by the auth store to avoid circular imports
// ---------------------------------------------------------------------------
let _onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  _onUnauthorized = handler;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------
async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: RequestOptions,
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

  let fetchBody: string | URLSearchParams | undefined;

  if (options?.formData) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    // React Native fetch doesn't auto-serialize URLSearchParams — must call .toString()
    fetchBody = options.formData.toString();
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

  // 401 Unauthorized → trigger sign-out
  if (response.status === 401 && !options?.noAuth) {
    _onUnauthorized?.();
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const rawDetail = (data as { detail?: unknown })?.detail;
    let detail: string;

    if (Array.isArray(rawDetail)) {
      // FastAPI validation errors: [{type, loc, msg, input}, ...]
      detail = rawDetail
        .map((e: { msg?: string }) => e?.msg ?? String(e))
        .join(". ");
    } else if (typeof rawDetail === "string") {
      detail = rawDetail;
    } else if (typeof data === "string") {
      detail = data;
    } else {
      detail = `Request failed (${response.status})`;
    }

    throw new ApiError(response.status, detail);
  }

  return data as T;
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
