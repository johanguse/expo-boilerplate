import { API_V1 } from "@config/api";
import { storage, StorageKeys } from "@utils/storage";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  headers?: Record<string, string>;
  /** If true, skip the Authorization header */
  noAuth?: boolean;
  /** If provided, send as form-urlencoded instead of JSON */
  formData?: URLSearchParams;
}

class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_V1}${path}`;

  const headers: Record<string, string> = {
    ...(options?.headers ?? {}),
  };

  // Add auth token unless explicitly skipped
  if (!options?.noAuth) {
    const token = storage.getString(StorageKeys.ACCESS_TOKEN);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let fetchBody: string | URLSearchParams | undefined;

  if (options?.formData) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    fetchBody = options.formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  const response = await fetch(url, {
    method,
    headers,
    body: fetchBody,
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail =
      data?.detail ??
      (typeof data === "string" ? data : `Request failed (${response.status})`);
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

export { ApiError };
