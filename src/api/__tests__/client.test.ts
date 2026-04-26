/**
 * Tests for the API client (src/api/client.ts)
 *
 * These tests mock `fetch` to verify:
 * - JSON request/response handling
 * - JWT token injection from storage
 * - Error handling (non-200 responses)
 * - Form-urlencoded support
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
    USER_PROFILE: "user_profile",
    ONBOARDING_DONE: "onboarding_done",
  },
}));

jest.mock("@config/api", () => ({
  API_BASE_URL: "http://test-api.local",
  API_V1: "http://test-api.local/api/v1",
}));

import { ApiError, apiClient } from "@api/client";
import { storage } from "@lib/storage";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("apiClient", () => {
  describe("GET requests", () => {
    it("should make a GET request with auth token", async () => {
      (storage.getString as jest.Mock).mockReturnValue("test-jwt-token");
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 1, name: "Test User" }),
      });

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
      expect(result).toEqual({ id: 1, name: "Test User" });
    });

    it("should make a GET request without auth when noAuth is true", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: "ok" }),
      });

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
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiClient.get("/users/me");

      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders.Authorization).toBeUndefined();
    });
  });

  describe("POST requests", () => {
    it("should send JSON body for POST requests", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 1 }),
      });

      await apiClient.post("/auth/register", {
        email: "test@test.com",
        password: "password123",
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
          }),
        }),
      );
    });

    it("should send form-urlencoded data when formData is provided", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "jwt123", token_type: "bearer" }),
      });

      const form = new URLSearchParams();
      form.append("username", "test@test.com");
      form.append("password", "password123");

      const result = await apiClient.post("/auth/jwt/login", undefined, {
        noAuth: true,
        formData: form,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test-api.local/api/v1/auth/jwt/login",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
        }),
      );
      expect(result).toEqual({
        access_token: "jwt123",
        token_type: "bearer",
      });
    });
  });

  describe("Error handling", () => {
    it("should throw ApiError on non-OK response with detail", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ detail: "LOGIN_BAD_CREDENTIALS" }),
      });

      await expect(
        apiClient.post("/auth/jwt/login", undefined, { noAuth: true }),
      ).rejects.toThrow(ApiError);
      await expect(
        apiClient.post("/auth/jwt/login", undefined, { noAuth: true }),
      ).rejects.toMatchObject({
        status: 401,
        detail: "Invalid email or password.",
      });
    });

    it("should throw ApiError with generic message when no detail", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => null,
      });

      await expect(apiClient.get("/crash")).rejects.toThrow(ApiError);
    });

    it("should handle 204 No Content responses", async () => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const result = await apiClient.delete("/resource/1");
      expect(result).toBeUndefined();
    });
  });

  describe("HTTP methods", () => {
    beforeEach(() => {
      (storage.getString as jest.Mock).mockReturnValue("token");
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    });

    it("should support PUT", async () => {
      await apiClient.put("/users/1", { name: "Updated" });
      expect(mockFetch.mock.calls[0][1].method).toBe("PUT");
    });

    it("should support PATCH", async () => {
      await apiClient.patch("/users/1", { name: "Patched" });
      expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
    });

    it("should support DELETE", async () => {
      await apiClient.delete("/users/1");
      expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
    });
  });
});
