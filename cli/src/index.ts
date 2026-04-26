#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { Command } from "commander";
import { promptUser } from "./prompts.js";
import { runScaffolder } from "./scaffolder.js";
import type { Answers } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEXT_ART = `
${chalk.cyan("  ███████╗██╗  ██╗██████╗  ██████╗")}
${chalk.cyan("  ██╔════╝╚██╗██╔╝██╔══██╗██╔═══██╗")}
${chalk.cyan("  █████╗   ╚███╔╝ ██████╔╝██║   ██║")}
${chalk.cyan("  ██╔══╝   ██╔██╗ ██╔═══╝ ██║   ██║")}
${chalk.cyan("  ███████╗██╔╝ ██╗██║     ╚██████╔╝")}
${chalk.cyan("  ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝")}

${chalk.white.bold("  ──── • Expo Boilerplate • ────")}
${chalk.gray("  FastAPI • HeroUI • Uniwind • RevenueCat")}
`;

const program = new Command();

program
  .name("create-expo-boilerplate")
  .description(
    "Create a new Expo app from the boilerplate with FastAPI backend",
  )
  .version("0.1.0")
  .argument("[project-name]", "Name of the project")
  .option("-d, --default", "Skip prompts and use defaults")
  .option("--yes", "Skip confirmation prompts")
  .action(
    async (
      projectName: string | undefined,
      options: { default?: boolean; yes?: boolean },
    ) => {
      console.log("");
      console.log(TEXT_ART);
      console.log("");

      try {
        let answers: Answers;

        if (projectName && options.default) {
          answers = {
            projectName,
            bundleId: `com.company.${projectName.replace(/-/g, "")}`,
            packageManager: "npm",
            features: ["api-backend", "onboarding"],
            apiBaseUrl: "http://localhost:8000",
          };
        } else {
          answers = await promptUser(projectName);
        }

        // Template is the parent of cli/ directory
        const templateDir = path.resolve(__dirname, "../..");

        await runScaffolder(answers, templateDir, options.yes);

        console.log("");
        console.log(chalk.green("✓ Project created successfully!"));
        console.log("");
        printNextSteps(answers);
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          error.name === "ExitPromptError"
        ) {
          console.log("");
          console.log(chalk.gray("Cancelled."));
          process.exit(0);
        }

        if (error instanceof Error) {
          console.error("");
          console.error(chalk.red("Error:"), error.message);
        }
        process.exit(1);
      }
    },
  );

function printNextSteps(answers: Answers) {
  const { projectName, packageManager, features } = answers;

  const installCmd =
    packageManager === "yarn"
      ? "yarn"
      : packageManager === "bun"
        ? "bun install"
        : `${packageManager} install`;

  console.log(chalk.cyan("Next steps:"));
  console.log("");
  console.log(chalk.gray("1. Navigate to your project:"));
  console.log(`   ${chalk.white("cd")} ${chalk.cyan(projectName)}`);
  console.log("");
  console.log(chalk.gray("2. Install dependencies:"));
  console.log(`   ${chalk.cyan(installCmd)}`);
  console.log("");
  console.log(chalk.gray("3. Run prebuild:"));
  console.log(`   ${chalk.cyan("npx expo prebuild --clean")}`);
  console.log("");
  console.log(chalk.gray("4. Run on iOS:"));
  console.log(`   ${chalk.cyan("npx expo run:ios")}`);
  console.log("");

  if (features.includes("api-backend")) {
    console.log(chalk.yellow("API Backend:"));
    console.log(
      `   Update ${chalk.white("app.json > expo.extra.apiBaseUrl")} with your API URL`,
    );
    console.log("");
  }

  if (features.includes("revenuecat")) {
    console.log(chalk.yellow("RevenueCat setup:"));
    console.log(
      `   Update API keys in ${chalk.white("src/config/revenuecat.ts")}`,
    );
    console.log("");
  }

  console.log(chalk.gray("Happy coding! 🚀"));
  console.log("");
}

program.parse();
