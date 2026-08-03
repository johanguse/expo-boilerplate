import { getCurrentUser, type UserProfile } from "./auth";
import { apiClient } from "./client";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Every field is optional, but at least one must be present. */
export interface UpdateProfilePayload {
  name?: string;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  country?: string | null;
  timezone?: string | null;
  bio?: string | null;
  website?: string | null;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Update the current user's profile. Returns the full updated user.
 */
export async function updateProfileAPI(
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  return apiClient.patch<UserProfile>("/users/me", payload);
}

/**
 * Upload a new profile avatar image.
 *
 * The backend stores the file in R2, points the user record at it, and returns
 * the updated user with `image` already resolved to a fetchable URL.
 */
export async function uploadAvatarAPI(fileUri: string): Promise<UserProfile> {
  const filename = fileUri.split("/").pop() ?? "avatar.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  const mime = mimeMap[ext] ?? "image/jpeg";

  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    name: filename,
    type: mime,
  } as unknown as Blob);

  // No explicit Content-Type — fetch has to set the multipart boundary itself.
  return apiClient.post<UserProfile>("/users/me/avatar", formData);
}

/**
 * Delete the current user's profile avatar. Returns the updated user.
 */
export async function deleteAvatarAPI(): Promise<void> {
  await apiClient.delete("/users/me/avatar");
}

/**
 * Object-style API (optional convenience for query hooks)
 */
export const profileApi = {
  getMe: getCurrentUser,
  update: updateProfileAPI,
  uploadAvatar: uploadAvatarAPI,
  deleteAvatar: deleteAvatarAPI,
};
