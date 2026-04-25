/**
 * Native Google services config (after `expo prebuild`).
 * Place `google-services.json` under `android/app/` and
 * `GoogleService-Info.plist` under `ios/` (or paths your build uses).
 */
export const GOOGLE_SERVICES = {
  androidJson: "./android/app/google-services.json",
  iosPlist: "./ios/GoogleService-Info.plist",
} as const;
