import type { FeatureToggleConfig } from "./types.js";

/**
 * API Backend feature toggle — removes API client, auth store, auth screens, profile
 */
export const API_BACKEND_TOGGLE: FeatureToggleConfig = {
  filesToRemove: [
    "src/api",
    "src/config/api.ts",
    "src/app/(auth)/signup.tsx",
    "src/app/(auth)/forgot-password.tsx",
    "src/app/(tabs)/profile.tsx",
  ],
  filesToModify: [],
  dependenciesToRemove: [],
  pluginsToRemove: [],
  providersToRemove: [],
  contextsToRemove: [],
};

/**
 * Onboarding feature toggle — removes onboarding flow
 */
export const ONBOARDING_TOGGLE: FeatureToggleConfig = {
  filesToRemove: [
    "src/contexts/onboarding-context.tsx",
    "src/app/onboarding",
    "src/components/onboarding",
  ],
  filesToModify: [],
  dependenciesToRemove: [],
  pluginsToRemove: [],
  providersToRemove: ["OnboardingProvider"],
  contextsToRemove: ["onboarding-context"],
};

/**
 * RevenueCat feature toggle — removes paywall and purchases
 */
export const REVENUECAT_TOGGLE: FeatureToggleConfig = {
  filesToRemove: [
    "src/contexts/revenuecat-context.tsx",
    "src/config/revenuecat.ts",
  ],
  filesToModify: [],
  dependenciesToRemove: [
    "react-native-purchases",
    "react-native-purchases-ui",
  ],
  pluginsToRemove: [],
  providersToRemove: ["RevenueCatProvider"],
  contextsToRemove: ["revenuecat-context"],
};

/**
 * Get feature toggle configuration by feature name
 */
export function getFeatureToggle(feature: string): FeatureToggleConfig {
  switch (feature) {
    case "api-backend":
      return API_BACKEND_TOGGLE;
    case "onboarding":
      return ONBOARDING_TOGGLE;
    case "revenuecat":
      return REVENUECAT_TOGGLE;
    default:
      throw new Error(`Unknown feature: ${feature}`);
  }
}
