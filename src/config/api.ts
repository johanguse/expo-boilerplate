import Constants from "expo-constants";

/**
 * API Base URL - reads from app.json extra config, falls back to localhost.
 * Update app.json > expo.extra.apiBaseUrl for your environment.
 */
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ??
  "http://localhost:8000";

export const API_V1 = `${API_BASE_URL}/api/v1`;
