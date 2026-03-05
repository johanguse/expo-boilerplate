/**
 * Tests for the auth API module (src/services/api/auth.ts)
 *
 * These tests verify the auth API functions properly format requests
 * for the FastAPI backend (fastapi-users).
 */

// Mock the client module
jest.mock("@services/api/client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    detail: string;
    constructor(status: number, detail: string) {
      super(detail);
      this.status = status;
      this.detail = detail;
    }
  },
}));

import { apiClient } from "@services/api/client";
import {
  loginAPI,
  registerAPI,
  forgotPasswordAPI,
  getCurrentUser,
} from "@services/api/auth";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Auth API", () => {
  describe("loginAPI", () => {
    it("should call POST /auth/jwt/login with form-urlencoded data", async () => {
      const mockToken = { access_token: "jwt-token-123", token_type: "bearer" };
      (apiClient.post as jest.Mock).mockResolvedValue(mockToken);

      const result = await loginAPI("user@test.com", "password123");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/jwt/login",
        undefined,
        expect.objectContaining({
          noAuth: true,
          formData: expect.any(URLSearchParams),
        })
      );

      // Verify form data contains username (not email) as per fastapi-users
      const formData = (apiClient.post as jest.Mock).mock.calls[0][2]
        .formData as URLSearchParams;
      expect(formData.get("username")).toBe("user@test.com");
      expect(formData.get("password")).toBe("password123");

      expect(result).toEqual(mockToken);
    });
  });

  describe("registerAPI", () => {
    it("should call POST /auth/register with JSON body", async () => {
      const mockUser = {
        id: 1,
        email: "new@test.com",
        name: "Test User",
        is_active: true,
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockUser);

      const result = await registerAPI({
        email: "new@test.com",
        password: "securepass123",
        name: "Test User",
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/register",
        {
          email: "new@test.com",
          password: "securepass123",
          name: "Test User",
        },
        { noAuth: true }
      );
      expect(result.email).toBe("new@test.com");
    });

    it("should work without optional name field", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ id: 1 });

      await registerAPI({
        email: "noname@test.com",
        password: "password",
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/register",
        { email: "noname@test.com", password: "password" },
        { noAuth: true }
      );
    });
  });

  describe("forgotPasswordAPI", () => {
    it("should call POST /auth/forgot-password with email", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(undefined);

      await forgotPasswordAPI("forgot@test.com");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/forgot-password",
        { email: "forgot@test.com" },
        { noAuth: true }
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should call GET /users/me with auth token", async () => {
      const mockUser = {
        id: 1,
        email: "me@test.com",
        name: "Current User",
        role: "member",
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith("/users/me");
      expect(result.email).toBe("me@test.com");
    });
  });
});
