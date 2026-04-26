import path from "node:path";
import fs from "fs-extra";
import type { TokenMap } from "./types.js";

/**
 * Generate token replacement map from project name and bundle ID
 */
export function generateTokenMap(
  projectName: string,
  bundleId: string,
): TokenMap {
  const displayName = projectName
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  return {
    projectName,
    displayName,
    iosBundleIdentifier: bundleId,
    androidPackage: bundleId,
    scheme: projectName.replace(/-/g, ""),
  };
}

/**
 * Replace tokens in app.json
 */
export async function replaceTokensInAppJson(
  filePath: string,
  tokens: TokenMap,
): Promise<void> {
  if (!(await fs.exists(filePath))) return;

  const config = await fs.readJson(filePath);
  const expo = config.expo;

  expo.name = tokens.displayName;
  expo.slug = tokens.projectName;
  expo.scheme = tokens.scheme;

  if (expo.ios) {
    expo.ios.bundleIdentifier = tokens.iosBundleIdentifier;
  }
  if (expo.android) {
    if (!expo.android.package) {
      expo.android.package = tokens.androidPackage;
    } else {
      expo.android.package = tokens.androidPackage;
    }
  }

  await fs.writeJson(filePath, config, { spaces: 2 });
}

/**
 * Replace tokens in package.json
 */
export async function replaceTokensInPackageJson(
  filePath: string,
  tokens: TokenMap,
): Promise<void> {
  if (!(await fs.exists(filePath))) return;

  const pkg = await fs.readJson(filePath);
  pkg.name = tokens.projectName;

  await fs.writeJson(filePath, pkg, { spaces: 2 });
}

/**
 * Check if a file should have token replacement applied
 */
export function shouldReplaceTokensInFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return [".ts", ".tsx", ".js", ".jsx", ".json", ".md"].includes(ext);
}

/**
 * Replace token placeholders in a text file
 */
export async function replaceTokensInFile(
  filePath: string,
  tokens: TokenMap,
): Promise<void> {
  let content = await fs.readFile(filePath, "utf-8");

  // Replace known boilerplate identifiers
  content = content.replace(/expo-boilerplate/g, tokens.projectName);
  content = content.replace(
    /com\.anonymous\.expo-boilerplate/g,
    tokens.iosBundleIdentifier,
  );

  await fs.writeFile(filePath, content, "utf-8");
}
