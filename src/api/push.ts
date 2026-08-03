import { Platform } from "react-native";
import { apiClient } from "./client";

/**
 * Register this device's FCM/APNs token for the current user.
 *
 * Backed by `POST /api/v1/users/me/devices`, which upserts on (user, token) —
 * calling it again with the same token is harmless.
 */
export async function registerPushToken(token: string): Promise<void> {
  await apiClient.post("/users/me/devices", {
    token,
    platform: Platform.OS === "android" ? "android" : "ios",
  });
}

/**
 * Unregister a device token — call on sign-out so the device stops receiving
 * notifications meant for the previous account.
 */
export async function unregisterPushToken(token: string): Promise<void> {
  await apiClient.delete(`/users/me/devices/${encodeURIComponent(token)}`);
}
