import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Default backend: cloudflare-backend-app-boilerplate (`bun run dev` → wrangler
 * on port 8787).
 *
 * The Android emulator can't reach the host's `localhost` — 10.0.2.2 is the
 * loopback alias that maps to it. Physical devices need the machine's LAN IP.
 */
const DEFAULT_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const DEFAULT_BASE_URL = `http://${DEFAULT_HOST}:8787`;

/**
 * `expo.extra` is baked into the native binary at build time (expo-constants
 * writes `EXConstants.bundle/app.config` during prebuild/compile), so editing
 * app.json does nothing until you rebuild with `bun run ios` / `bun run android`.
 *
 * `EXPO_PUBLIC_API_URL` is inlined by Metro when it bundles, so it only needs a
 * dev-server restart — prefer it while developing.
 */
const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const fromAppConfig = Constants.expoConfig?.extra?.apiBaseUrl as
  | string
  | undefined;

export const API_BASE_URL: string =
  fromEnv ?? fromAppConfig ?? DEFAULT_BASE_URL;

export const API_V1 = `${API_BASE_URL}/api/v1`;

if (__DEV__) {
  const source = fromEnv
    ? "EXPO_PUBLIC_API_URL"
    : fromAppConfig
      ? "app.json extra (baked in at native build time)"
      : "built-in default";
  console.log(`[api] base URL ${API_BASE_URL} — from ${source}`);
}
