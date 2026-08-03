import { apiClient } from "./client";

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Returned by login/register. `accessToken` is a short-lived (15m) JWT;
 * `refreshToken` is the long-lived session token used against `/auth/refresh`.
 * Both are null when registration completes but email verification is required
 * before a session is issued.
 */
export interface AuthToken {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthSession extends AuthToken {
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  /** Avatar URL, already resolved by the backend — safe to use directly. */
  image: string | null;
  bio: string | null;
  company: string | null;
  jobTitle: string | null;
  phone: string | null;
  website: string | null;
  country: string | null;
  timezone: string | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Login with email & password.
 */
export async function loginAPI(
  email: string,
  password: string,
): Promise<AuthSession> {
  return apiClient.post<AuthSession>(
    "/auth/login",
    { email, password },
    { noAuth: true },
  );
}

/**
 * Register a new user account.
 *
 * Returns a session directly when the backend is running with email
 * verification off (the default locally); otherwise the tokens are null and the
 * user must verify before signing in.
 */
export async function registerAPI(
  payload: RegisterPayload,
): Promise<AuthSession> {
  return apiClient.post<AuthSession>("/auth/register", payload, {
    noAuth: true,
  });
}

/**
 * Exchange a refresh token for a fresh access token.
 */
export async function refreshTokenAPI(
  refreshToken: string,
): Promise<AuthToken> {
  return apiClient.post<AuthToken>(
    "/auth/refresh",
    { refreshToken },
    { noAuth: true },
  );
}

/**
 * Revoke the current session server-side.
 *
 * `skipSessionRecovery` matters here: this runs while signing out, so a 401
 * must not kick off a token refresh or re-enter the sign-out handler.
 */
export async function logoutAPI(): Promise<void> {
  await apiClient.post("/auth/logout", undefined, {
    skipSessionRecovery: true,
  });
}

/**
 * Request a password reset email.
 */
export async function forgotPasswordAPI(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email }, { noAuth: true });
}

/**
 * Get the current authenticated user's profile.
 */
export async function getCurrentUser(): Promise<UserProfile> {
  return apiClient.get<UserProfile>("/users/me");
}

/**
 * Change password for the currently authenticated user.
 */
export async function changePasswordAPI(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  return apiClient.post("/users/me/change-password", {
    currentPassword,
    newPassword,
  });
}

/**
 * Resend email verification to the given address.
 */
export async function resendVerificationAPI(
  email: string,
): Promise<{ success: boolean; message: string }> {
  return apiClient.post(
    "/auth/resend-verification",
    { email },
    { noAuth: true },
  );
}
