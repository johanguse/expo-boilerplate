/**
 * Answers collected from user prompts
 */
export interface Answers {
  /** Name of the project (folder name and display name) */
  projectName: string;
  /** Bundle identifier (e.g., com.company.app) */
  bundleId: string;
  /** Package manager to use */
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
  /** Selected features */
  features: Feature[];
  /** API base URL (if api-backend feature enabled) */
  apiBaseUrl?: string;
}

/**
 * Optional features that can be toggled
 */
export type Feature = "api-backend" | "onboarding" | "revenuecat";

/**
 * Token replacement map
 */
export interface TokenMap {
  projectName: string;
  displayName: string;
  iosBundleIdentifier: string;
  androidPackage: string;
  scheme: string;
}

/**
 * File operations for feature toggles
 */
export interface FileOperation {
  path: string;
  operation: "remove" | "modify";
  modifications?: Modification[];
}

/**
 * Single modification within a file
 */
export interface Modification {
  type:
    | "remove-line"
    | "remove-import"
    | "remove-provider"
    | "remove-call"
    | "replace";
  pattern: string | RegExp;
  replacement?: string;
}

/**
 * Feature toggle configuration
 */
export interface FeatureToggleConfig {
  filesToRemove: string[];
  filesToModify: FileOperation[];
  dependenciesToRemove: string[];
  pluginsToRemove: (string | object)[];
  providersToRemove: string[];
  contextsToRemove: string[];
}
