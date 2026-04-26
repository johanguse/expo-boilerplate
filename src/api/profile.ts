import { getCurrentUser, type UserProfile } from "./auth";
import { apiClient } from "./client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  country?: string;
  timezone?: string;
  bio?: string;
  website?: string;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Update the current user's profile.
 */
export async function updateProfileAPI(
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  return apiClient.patch<UserProfile>("/users/me", payload);
}

/**
 * Upload a new profile avatar image.
 * Sends multipart/form-data to the backend.
 */
export async function uploadAvatarAPI(
  fileUri: string,
): Promise<{ avatar_url: string }> {
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

  return apiClient.post<{ avatar_url: string }>(
    "/users/profile/image",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
}

/**
 * Delete the current user's profile avatar.
 */
export async function deleteAvatarAPI(): Promise<void> {
  return apiClient.delete("/users/profile/image");
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
