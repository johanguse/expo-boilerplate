import { apiClient } from "./client";

/**
 * Register the FCM device token for the current user.
 * Backed by `POST /api/v1/users/me/push-token` (add in FastAPI when needed).
 */
export async function registerPushToken(token: string): Promise<void> {
  await apiClient.post("/users/me/push-token", { token });
}
