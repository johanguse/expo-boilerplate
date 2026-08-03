/**
 * Tests for the auth API module (src/api/auth.ts)
 *
 * These verify each call targets the right Cloudflare Worker route with the
 * right body. Response shapes are already unwrapped by the client, so the
 * mocks return the payload the backend puts inside `{ data: … }`.
 */

jest.mock("@api/client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    code: string;
    constructor(status: number, message: string, code = "UNKNOWN") {
      super(message);
      this.status = status;
      this.code = code;
    }
  },
}));

import {
  changePasswordAPI,
  forgotPasswordAPI,
  getCurrentUser,
  loginAPI,
  logoutAPI,
  refreshTokenAPI,
  registerAPI,
  resendVerificationAPI,
} from "@api/auth";
import { apiClient } from "@api/client";

/** A `publicUserRow` payload as the backend serialises it. */
const userFixture = {
  id: "usr_123",
  email: "me@test.com",
  name: "Current User",
  emailVerified: true,
  image: null,
  bio: null,
  company: null,
  jobTitle: null,
  phone: null,
  website: null,
  country: null,
  timezone: null,
  onboardingCompleted: false,
  onboardingStep: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Auth API", () => {
  describe("loginAPI", () => {
    it("posts /auth/login and returns a session with both tokens", async () => {
      const session = {
        accessToken: "jwt-token-123",
        refreshToken: "session-token-456",
        user: userFixture,
      };
      (apiClient.post as jest.Mock).mockResolvedValue(session);

      const result = await loginAPI("user@test.com", "password123");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/login",
        { email: "user@test.com", password: "password123" },
        { noAuth: true },
      );
      expect(result).toEqual(session);
    });
  });

  describe("registerAPI", () => {
    it("posts /auth/register with email, password and name", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        accessToken: "jwt",
        refreshToken: "session",
        user: { ...userFixture, email: "new@test.com" },
      });

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
        { noAuth: true },
      );
      expect(result.user.email).toBe("new@test.com");
    });

    it("returns null tokens when the account needs email verification", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        accessToken: null,
        refreshToken: null,
        user: { ...userFixture, emailVerified: false },
      });

      const result = await registerAPI({
        email: "unverified@test.com",
        password: "securepass123",
        name: "Test User",
      });

      expect(result.accessToken).toBeNull();
      expect(result.refreshToken).toBeNull();
    });
  });

  describe("refreshTokenAPI", () => {
    it("posts /auth/refresh without the (expired) access token", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        accessToken: "fresh-jwt",
        refreshToken: "session-token-456",
      });

      const result = await refreshTokenAPI("session-token-456");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/refresh",
        { refreshToken: "session-token-456" },
        { noAuth: true },
      );
      expect(result.accessToken).toBe("fresh-jwt");
    });
  });

  describe("logoutAPI", () => {
    it("posts /auth/logout with session recovery disabled", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(undefined);

      await logoutAPI();

      // A 401 here must not refresh or re-enter sign-out.
      expect(apiClient.post).toHaveBeenCalledWith("/auth/logout", undefined, {
        skipSessionRecovery: true,
      });
    });
  });

  describe("forgotPasswordAPI", () => {
    it("posts /auth/forgot-password with the email", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(undefined);

      await forgotPasswordAPI("forgot@test.com");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/forgot-password",
        { email: "forgot@test.com" },
        { noAuth: true },
      );
    });
  });

  describe("resendVerificationAPI", () => {
    it("posts /auth/resend-verification with the email", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        success: true,
        message: "Verification email sent.",
      });

      await resendVerificationAPI("unverified@test.com");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/resend-verification",
        { email: "unverified@test.com" },
        { noAuth: true },
      );
    });
  });

  describe("changePasswordAPI", () => {
    it("posts /users/me/change-password with camelCase keys", async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        success: true,
        message: "Password updated.",
      });

      await changePasswordAPI("old-password", "new-password");

      expect(apiClient.post).toHaveBeenCalledWith("/users/me/change-password", {
        currentPassword: "old-password",
        newPassword: "new-password",
      });
    });
  });

  describe("getCurrentUser", () => {
    it("gets /users/me with the auth token", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(userFixture);

      const result = await getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith("/users/me");
      expect(result.email).toBe("me@test.com");
      expect(result.onboardingCompleted).toBe(false);
    });
  });
});
