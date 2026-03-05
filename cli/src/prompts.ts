import * as inquirer from "@inquirer/prompts";
import chalk from "chalk";
import type { Answers, Feature } from "./types.js";

/**
 * Validates project name (npm package name + folder safe)
 */
function validateProjectName(name: string): boolean | string {
  if (!name) return "Project name is required";
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(name)) {
    return "Project name must be lowercase letters, numbers, and hyphens only";
  }
  if (name.length > 214) return "Project name is too long (max 214 characters)";
  return true;
}

/**
 * Validates bundle ID format
 */
function validateBundleId(bundleId: string): boolean | string {
  if (!bundleId) return "Bundle ID is required";
  const bundleIdRegex =
    /^(?![0-9])[a-z][a-z0-9]*(\\.(?![0-9])[a-z][a-z0-9]*)+$/;
  if (!bundleIdRegex.test(bundleId)) {
    return "Bundle ID must be in reverse domain format (e.g., com.company.app)";
  }
  return true;
}

/**
 * Prompts user for all required information
 */
export async function promptUser(projectNameArg?: string): Promise<Answers> {
  const answers: Partial<Answers> = {};

  // Project name
  if (projectNameArg) {
    const validation = validateProjectName(projectNameArg);
    if (validation !== true) throw new Error(`Invalid project name: ${validation}`);
    answers.projectName = projectNameArg;
  } else {
    answers.projectName = await inquirer.input({
      message: "What is your project name?",
      default: "my-expo-app",
      validate: validateProjectName,
    });
  }

  // Bundle ID
  const defaultBundleId = `com.company.${answers.projectName!.replace(/-/g, "")}`;
  answers.bundleId = await inquirer.input({
    message: "What is your bundle identifier?",
    default: defaultBundleId,
    validate: validateBundleId,
  });

  // Package manager
  answers.packageManager = await inquirer.select({
    message: "Which package manager do you want to use?",
    choices: [
      { name: "npm", value: "npm" as const, description: "Default Node.js package manager" },
      { name: "pnpm", value: "pnpm" as const, description: "Fast, disk space efficient" },
      { name: "yarn", value: "yarn" as const, description: "Fast, reliable package manager" },
      { name: "bun", value: "bun" as const, description: "Fast JavaScript runtime & package manager" },
    ],
    default: "npm",
  });

  // Features
  answers.features = ((await inquirer.checkbox({
    message: "Which features would you like to include?",
    choices: [
      {
        name: "API Backend (FastAPI)",
        value: "api-backend" as Feature,
        description: "Auth, API client, and profile connected to FastAPI backend",
        checked: true,
      },
      {
        name: "Onboarding Flow",
        value: "onboarding" as Feature,
        description: "Multi-step onboarding with step progress indicator",
        checked: true,
      },
      {
        name: "RevenueCat (In-app purchases)",
        value: "revenuecat" as Feature,
        description: "Paywall and subscription management via RevenueCat",
        checked: false,
      },
    ],
  })) ?? []) as Feature[];

  // API base URL (if API backend selected)
  if (answers.features.includes("api-backend")) {
    console.log("");
    console.log(chalk.yellow("API Backend configuration:"));
    answers.apiBaseUrl = await inquirer.input({
      message: "What is your API base URL?",
      default: "http://localhost:8000",
    });
  }

  return answers as Answers;
}
