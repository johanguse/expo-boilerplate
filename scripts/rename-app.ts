#!/usr/bin/env bun
/**
 * Rebrand the boilerplate for a new app: updates app.json and package.json.
 * After running, add Firebase config files and run `expo prebuild --clean` (see README).
 *
 * Usage:
 *   bun run scripts/rename-app.ts -- --name "My App" --slug my-app
 *   bun run scripts/rename-app.ts -- --name "My App" --slug my-app --ios com.acme.coolapp --android com.acme.coolapp
 *   bun run scripts/rename-app.ts -- --help
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Run from repository root (`bun run rename-app` / `bun run scripts/rename-app.ts`). */
const root = process.cwd();

type Args = {
  name: string | null;
  slug: string | null;
  scheme: string | null;
  ios: string | null;
  android: string | null;
  help: boolean;
};

function parseArgs(argv: string[]): Args {
  const out: Args = {
    name: null,
    slug: null,
    scheme: null,
    ios: null,
    android: null,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--name" && argv[i + 1]) {
      out.name = argv[++i] ?? null;
    } else if (a === "--slug" && argv[i + 1]) {
      out.slug = argv[++i] ?? null;
    } else if (a === "--scheme" && argv[i + 1]) {
      out.scheme = argv[++i] ?? null;
    } else if (a === "--ios" && argv[i + 1]) {
      out.ios = argv[++i] ?? null;
    } else if (a === "--android" && argv[i + 1]) {
      out.android = argv[++i] ?? null;
    }
  }
  return out;
}

/** Android applicationId cannot use hyphens; mirror Expo prebuild by stripping them per segment. */
function androidIdFromBundleId(iosBundleId: string): string {
  return iosBundleId
    .split(".")
    .map((seg) => seg.replace(/-/g, ""))
    .join(".");
}

function slugToScheme(slug: string): string {
  return slug.replace(/[^a-z0-9-]/gi, "").replace(/-/g, "");
}

function printHelp(): void {
  console.log(`
Rebrand this boilerplate (app.json + package.json).

Required:
  --name "Display Name"     App name shown on home screen
  --slug my-app            Expo slug (kebab-case, no spaces)

Optional:
  --scheme myapp           URL scheme (letters/numbers, default: slug without hyphens)
  --ios com.vendor.app     iOS bundle identifier (default: current app.json)
  --android com.vendor.appid  Android applicationId (default: iOS with hyphens removed from segments)

After running:
  1. If ios/ or android/ already exist, remove them: rm -rf ios android
  2. Add Firebase iOS: GoogleService-Info.plist, Android: google-services.json
  3. Run: npx expo prebuild --clean
  4. Run on device/simulator: npx expo run:ios | run:android

Example:
  bun run scripts/rename-app.ts -- --name "Acme" --slug acme --ios com.acme.shopper --android com.acme.shopper
`);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.name || !args.slug) {
    console.error("Error: --name and --slug are required.\n");
    printHelp();
    process.exit(1);
  }

  const appJsonPath = join(root, "app.json");
  const pkgJsonPath = join(root, "package.json");

  if (!existsSync(appJsonPath) || !existsSync(pkgJsonPath)) {
    console.error("app.json or package.json not found. Run from repo root.");
    process.exit(1);
  }

  const appJson = JSON.parse(readFileSync(appJsonPath, "utf-8")) as {
    expo: Record<string, unknown>;
  };
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as {
    name: string;
  };

  const scheme = args.scheme?.trim() ?? slugToScheme(args.slug);
  const iosBundle = args.ios?.trim() ?? (appJson.expo.ios as { bundleIdentifier?: string })?.bundleIdentifier;
  if (!iosBundle) {
    console.error("Set --ios or keep a valid app.json with expo.ios.bundleIdentifier.");
    process.exit(1);
  }

  const androidPackage = args.android?.trim() ?? androidIdFromBundleId(iosBundle);

  (appJson.expo as { name: string }).name = args.name;
  (appJson.expo as { slug: string }).slug = args.slug;
  (appJson.expo as { scheme: string }).scheme = scheme;
  (appJson.expo as { ios: { bundleIdentifier: string; supportsTablet?: boolean } }).ios = {
    ...((appJson.expo.ios as object) ?? {}),
    bundleIdentifier: iosBundle,
  };
  (appJson.expo as { android: { package: string } & Record<string, unknown> }).android = {
    ...((appJson.expo.android as object) ?? {}),
    package: androidPackage,
  };

  pkgJson.name = args.slug;

  writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`, "utf-8");
  writeFileSync(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`, "utf-8");

  const hasNative = existsSync(join(root, "ios")) || existsSync(join(root, "android"));
  console.log("Updated app.json and package.json.");
  console.log({
    name: args.name,
    slug: args.slug,
    scheme,
    ios: iosBundle,
    android: androidPackage,
    "package.json name": args.slug,
  });
  if (hasNative) {
    console.log(
      "\n⚠️  ios/ and/or android/ exist. Remove them, then prebuild, so the new bundle IDs are applied:\n" +
        "   rm -rf ios android && npx expo prebuild --clean"
    );
  } else {
    console.log(
      "\nNext: add Firebase config files (see README), then: npx expo prebuild --clean"
    );
  }
}

main();
