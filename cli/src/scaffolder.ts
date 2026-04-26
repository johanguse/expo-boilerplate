import path from "node:path";
import * as inquirer from "@inquirer/prompts";
import fg from "fast-glob";
import fs from "fs-extra";
import ora, { type Ora } from "ora";
import { getFeatureToggle } from "./feature-toggles.js";
import {
  applyFeatureToggles,
  copyTemplate,
  removeFiles,
} from "./file-operations.js";
import {
  generateTokenMap,
  replaceTokensInAppJson,
  replaceTokensInFile,
  replaceTokensInPackageJson,
  shouldReplaceTokensInFile,
} from "./tokens.js";
import type { Answers, Feature } from "./types.js";

/**
 * Main scaffolder function
 */
export async function runScaffolder(
  answers: Answers,
  templateDir: string,
  skipConfirm: boolean = false,
): Promise<void> {
  const targetDir = path.resolve(process.cwd(), answers.projectName);

  // Check if target directory exists
  if (await fs.exists(targetDir)) {
    if (!skipConfirm) {
      const confirm = await inquirer.confirm({
        message: `Directory "${answers.projectName}" already exists. Overwrite?`,
        default: false,
      });
      if (!confirm) throw new Error("Cancelled by user");
    }
    await fs.remove(targetDir);
  }

  let spinner: Ora;

  // Step 1: Copy template
  spinner = ora("Copying template files...").start();
  try {
    await copyTemplate(templateDir, targetDir);
    spinner.succeed("Template files copied");
  } catch (error) {
    spinner.fail("Failed to copy template");
    throw error;
  }

  // Step 2: Apply token replacements
  spinner = ora("Applying project configuration...").start();
  try {
    const tokens = generateTokenMap(answers.projectName, answers.bundleId);

    await replaceTokensInAppJson(path.join(targetDir, "app.json"), tokens);
    await replaceTokensInPackageJson(
      path.join(targetDir, "package.json"),
      tokens,
    );

    // Replace API base URL if provided
    if (answers.apiBaseUrl) {
      const appJsonPath = path.join(targetDir, "app.json");
      const appJson = await fs.readJson(appJsonPath);
      if (appJson.expo?.extra) {
        appJson.expo.extra.apiBaseUrl = answers.apiBaseUrl;
      }
      await fs.writeJson(appJsonPath, appJson, { spaces: 2 });
    }

    // Replace tokens in all text files
    const files = await fg("**/*", {
      cwd: targetDir,
      ignore: ["node_modules/**", "dist/**", ".git/**", "ios/**", "android/**"],
    });

    for (const file of files) {
      const filePath = path.join(targetDir, file);
      if (shouldReplaceTokensInFile(filePath)) {
        await replaceTokensInFile(filePath, tokens);
      }
    }

    spinner.succeed("Project configuration applied");
  } catch (error) {
    spinner.fail("Failed to apply configuration");
    throw error;
  }

  // Step 3: Apply feature toggles
  spinner = ora("Applying feature configuration...").start();
  try {
    const allFeatures: Feature[] = ["api-backend", "onboarding", "revenuecat"];
    const featuresToDisable = allFeatures.filter(
      (f) => !answers.features.includes(f),
    );

    for (const feature of featuresToDisable) {
      const config = getFeatureToggle(feature);
      await removeFiles(targetDir, config.filesToRemove);
      await applyFeatureToggles(targetDir, [config]);
    }

    spinner.succeed("Feature configuration applied");
  } catch (error) {
    spinner.fail("Failed to apply feature configuration");
    throw error;
  }

  // Step 4: Cleanup
  spinner = ora("Cleaning up...").start();
  try {
    // Remove CLI directory from scaffolded project
    await fs.remove(path.join(targetDir, "cli"));

    // Remove cache files
    const cacheFiles = await fg(["**/.DS_Store", "**/.cache/**"], {
      cwd: targetDir,
      dot: true,
    });
    for (const file of cacheFiles) {
      await fs.remove(path.join(targetDir, file));
    }

    spinner.succeed("Cleanup complete");
  } catch {
    spinner.warn("Some cleanup items failed (non-critical)");
  }
}
