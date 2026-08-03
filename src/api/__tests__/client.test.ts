/**
 * Tests for the API client (src/api/client.ts)
 *
 * These tests mock `fetch` to verify:
 * - JSON request/response handling and `{ data: … }` unwrapping
 * - JWT token injection from storage
 * - `{ error: { code, message } }` parsing
 * - The refresh-on-401 / replay-once path
 */

jest.mock("@lib/storage", () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    getBoolean: jest.fn(),
  },
  StorageKeys: {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    USER_PROFILE: "user_profile",
    ONBOARDING_DONE: "onboarding_done",
  },
}));

jest.mock("@config/api", () => ({
  API_BASE_URL: "http://test-api.local",
  API_V1: "http://test-api.local/api/v1",
}));

import {
  ApiError,
  ApiErrorCode,
  apiClient,
  getErrorMessage,
  setRefreshHandler,
  setUnauthorizedHandler,
} from "@api/client";
import { storage } from "@lib/storage";

const mockFetch = jest.fn();
global.fetch = mockFetch;

/** `{ data: … }` is the envelope every successful backend response uses. */
const ok = (data: unknown) => ({
  ok: true,
  status: 200,
  json: async () => ({ data }),
});

/** `{ error: { code, message } }` is the envelope every failure uses. */
const fail = (status: number, code: string, message: string) => ({
  ok: false,
  status,
  json: async () => ({ error: { code, message } }),
});

beforeEach(() => {
  jest.clearAllMocks();
  // Module-level handlers survive between tests — reset them so a test that
  // registers one can't leak into the next.
  setUnauthorizedHandler(() => {});
  setRefreshHandler(async () => false);
});

describe("apiClient", () => {
  describe("GET requests", () => {
    it("should make a GET request with auth token", async () => {
      (storage.getString as jest.Mock).mockReturnValue("test-jwt-token");
      mockFetch.mockResolvedValue(ok({ id: "u1", name: "Test User" }));

      const result = await apiClient.get("/users/me");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test-api.local/api/v1/users/me",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-jwt-token",
          }),
        }),
      );
      expect(result).toEqual({ id: "u1", name: "Test User" });
    });

    it("should make a GET request without auth when noAuth is true", async () => {
      mockFetch.mockResolvedValue(ok({ status: "ok" }));

      await apiClient.get("/health", { noAuth: true });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test-api.local/api/v1/health",
        expect.objectContaining({
          method: "GET",
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        }),
      );
    });

    it("should not include Authorization header when no token stored", async () => {
      (storage.getString as jest.Mock).mockReturnValue(undefined);
      mockFetch.mockResolvedValue(ok({}));

      await apiClient.get("/users/me");

      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders.Authorization).toBeUndefined();
    });
  });

  describe("Response envelope", () => {
    it("unwraps the { data } envelope", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue(ok({ id: "u1", email: "a@b.com" }));

      await expect(apiClient.get("/users/me")).resolves.toEqual({
        id: "u1",
        email: "a@b.com",
      });
    });

    it("passes through a body that isn't enveloped", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: "healthy" }),
      });

      await expect(apiClient.get("/health")).resolves.toEqual({
        status: "healthy",
      });
    });

    it("passes through a top-level array", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ id: "1" }, { id: "2" }],
      });

      await expect(apiClient.get("/items")).resolves.toEqual([
        { id: "1" },
        { id: "2" },
      ]);
    });
  });

  describe("POST requests", () => {
    it("should send JSON body for POST requests", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue(ok({ id: "u1" }));

      await apiClient.post("/auth/register", {
        email: "test@test.com",
        password: "password123",
        name: "Test User",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test-api.local/api/v1/auth/register",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            email: "test@test.com",
            password: "password123",
            name: "Test User",
          }),
        }),
      );
    });

    it("should send form-urlencoded data when formData is provided", async () => {
      mockFetch.mockResolvedValue(ok({ received: true }));

      const form = new URLSearchParams();
      form.append("grant_type", "refresh_token");

      const result = await apiClient.post("/auth/refresh", undefined, {
        noAuth: true,
        formData: form,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test-api.local/api/v1/auth/refresh",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
          body: "grant_type=refresh_token",
        }),
      );
      expect(result).toEqual({ received: true });
    });

    it("sends FormData untouched so fetch can set the multipart boundary", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue(ok({ id: "u1" }));

      const form = new FormData();
      form.append("file", "fake-blob");

      await apiClient.post("/users/me/avatar", form);

      const [, init] = mockFetch.mock.calls[0];
      expect(init.body).toBe(form);
      expect(init.headers["Content-Type"]).toBeUndefined();
    });
  });

  describe("Error handling", () => {
    it("throws an ApiError carrying the backend code and message", async () => {
      mockFetch.mockResolvedValue(
        fail(401, "INVALID_EMAIL_OR_PASSWORD", "Invalid email or password."),
      );

      await expect(
        apiClient.post("/auth/login", {}, { noAuth: true }),
      ).rejects.toMatchObject({
        status: 401,
        code: ApiErrorCode.InvalidCredentials,
        message: "Invalid email or password.",
      });
    });

    it("falls back to a generic message when the body has no error envelope", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => null,
      });

      await expect(apiClient.get("/crash")).rejects.toMatchObject({
        status: 500,
        code: "UNKNOWN",
        message: "Request failed (500)",
      });
    });

    it("falls back to a generic message when the body isn't JSON", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError("Unexpected token < in JSON");
        },
      });

      await expect(apiClient.get("/crash")).rejects.toThrow(
        "Request failed (502)",
      );
    });

    it("should handle 204 No Content responses", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue({ ok: true, status: 204 });

      const result = await apiClient.delete("/resource/1");
      expect(result).toBeUndefined();
    });
  });

  describe("401 session recovery", () => {
    it("refreshes the token and replays the request once", async () => {
      (storage.getString as jest.Mock).mockReturnValue("stale-token");
      const refresh = jest.fn(async () => true);
      setRefreshHandler(refresh);

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        })
        .mockResolvedValueOnce(ok({ id: "u1" }));

      await expect(apiClient.get("/users/me")).resolves.toEqual({ id: "u1" });
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("signs out when the refresh fails", async () => {
      (storage.getString as jest.Mock).mockReturnValue("stale-token");
      const onUnauthorized = jest.fn();
      setUnauthorizedHandler(onUnauthorized);
      setRefreshHandler(async () => false);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

      await expect(apiClient.get("/users/me")).rejects.toMatchObject({
        status: 401,
        code: ApiErrorCode.Unauthorized,
      });
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it("signs out when the replayed request also 401s", async () => {
      (storage.getString as jest.Mock).mockReturnValue("stale-token");
      const onUnauthorized = jest.fn();
      const refresh = jest.fn(async () => true);
      setUnauthorizedHandler(onUnauthorized);
      setRefreshHandler(refresh);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

      await expect(apiClient.get("/users/me")).rejects.toThrow(ApiError);
      // One refresh, one replay — not an endless retry loop.
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it("shares a single refresh across concurrent 401s", async () => {
      (storage.getString as jest.Mock).mockReturnValue("stale-token");
      const refresh = jest.fn(
        () =>
          new Promise<boolean>((resolve) =>
            setTimeout(() => resolve(true), 10),
          ),
      );
      setRefreshHandler(refresh);

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        })
        .mockResolvedValue(ok({ id: "u1" }));

      await Promise.all([apiClient.get("/a"), apiClient.get("/b")]);

      expect(refresh).toHaveBeenCalledTimes(1);
    });

    it("does not recover when skipSessionRecovery is set", async () => {
      (storage.getString as jest.Mock).mockReturnValue("stale-token");
      const refresh = jest.fn(async () => true);
      const onUnauthorized = jest.fn();
      setRefreshHandler(refresh);
      setUnauthorizedHandler(onUnauthorized);

      mockFetch.mockResolvedValue(
        fail(401, "UNAUTHORIZED", "Authentication required."),
      );

      // Sign-out calls this path; recovering here would recurse back into it.
      await expect(
        apiClient.post("/auth/logout", undefined, {
          skipSessionRecovery: true,
        }),
      ).rejects.toMatchObject({ status: 401 });
      expect(refresh).not.toHaveBeenCalled();
      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it("does not replay a FormData body", async () => {
      (storage.getString as jest.Mock).mockReturnValue("stale-token");
      const refresh = jest.fn(async () => true);
      const onUnauthorized = jest.fn();
      setRefreshHandler(refresh);
      setUnauthorizedHandler(onUnauthorized);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

      const form = new FormData();
      form.append("file", "fake-blob");

      await expect(
        apiClient.post("/users/me/avatar", form),
      ).rejects.toMatchObject({ status: 401 });
      expect(refresh).not.toHaveBeenCalled();
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("HTTP methods", () => {
    beforeEach(() => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue(ok({}));
    });

    it("should support PUT", async () => {
      await apiClient.put("/users/1", { name: "Updated" });
      expect(mockFetch.mock.calls[0][1].method).toBe("PUT");
    });

    it("should support PATCH", async () => {
      await apiClient.patch("/users/me", { name: "Patched" });
      expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
    });

    it("should support DELETE", async () => {
      await apiClient.delete("/users/me/avatar");
      expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
    });
  });
});

describe("getErrorMessage", () => {
  const FALLBACK = "Something went wrong.";

  it("returns a short server message", () => {
    const err = new ApiError(400, "Invalid email or password.");
    expect(getErrorMessage(err, FALLBACK)).toBe("Invalid email or password.");
  });

  it("collapses whitespace", () => {
    const err = new ApiError(400, "  Too   many\nrequests.  ");
    expect(getErrorMessage(err, FALLBACK)).toBe("Too many requests.");
  });

  it("falls back for messages longer than the display limit", () => {
    const err = new ApiError(500, "x".repeat(121));
    expect(getErrorMessage(err, FALLBACK)).toBe(FALLBACK);
  });

  it("falls back for serialized objects and arrays", () => {
    expect(getErrorMessage(new Error('{"issues":[]}'), FALLBACK)).toBe(
      FALLBACK,
    );
    expect(getErrorMessage(new Error("[ZodError]"), FALLBACK)).toBe(FALLBACK);
  });

  it("falls back for native error domains", () => {
    const native = 'Error Domain=NSCocoaErrorDomain Code=260 "missing file"';
    expect(getErrorMessage(new Error(native), FALLBACK)).toBe(FALLBACK);
  });

  it("falls back for stack frames", () => {
    const stack = "Boom at src/api/client.ts:42:11";
    expect(getErrorMessage(new Error(stack), FALLBACK)).toBe(FALLBACK);
  });

  it("falls back for empty, null, and non-error values", () => {
    expect(getErrorMessage(new Error("   "), FALLBACK)).toBe(FALLBACK);
    expect(getErrorMessage(null, FALLBACK)).toBe(FALLBACK);
    expect(getErrorMessage({ message: "nope" }, FALLBACK)).toBe(FALLBACK);
  });

  it("accepts plain strings", () => {
    expect(getErrorMessage("Email already in use.", FALLBACK)).toBe(
      "Email already in use.",
    );
  });
});
