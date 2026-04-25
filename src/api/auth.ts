import { apiClient } from "./client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  avatar_url: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  country: string | null;
  timezone: string | null;
  bio: string | null;
  website: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Login with email & password.
 * fastapi-users expects `application/x-www-form-urlencoded` with `username` field.
 */
export async function loginAPI(
  email: string,
  password: string
): Promise<AuthToken> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  return apiClient.post<AuthToken>("/auth/jwt/login", undefined, {
    noAuth: true,
    formData: form,
  });
}

/**
 * Register a new user account.
 */
export async function registerAPI(
  payload: RegisterPayload
): Promise<UserProfile> {
  return apiClient.post<UserProfile>("/auth/register", payload, {
    noAuth: true,
  });
}

/**
 * Request a password reset email.
 */
export async function forgotPasswordAPI(email: string): Promise<void> {
  return apiClient.post("/auth/forgot-password", { email }, { noAuth: true });
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
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  return apiClient.post("/users/me/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

/**
 * Resend email verification to the given address.
 */
export async function resendVerificationAPI(
  email: string
): Promise<{ success: boolean; message: string }> {
  return apiClient.post("/resend-verification", { email }, { noAuth: true });
}
