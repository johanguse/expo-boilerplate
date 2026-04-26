import path from "node:path";
import fs from "fs-extra";
import type {
  FeatureToggleConfig,
  FileOperation,
  Modification,
} from "./types.js";

/**
 * Copy the template directory to the target directory
 */
export async function copyTemplate(
  templateDir: string,
  targetDir: string,
): Promise<void> {
  await fs.copy(templateDir, targetDir, {
    filter: (src) => {
      const basename = path.basename(src);
      // Skip node_modules, .git, ios, android, .expo
      return ![
        "node_modules",
        ".git",
        "ios",
        "android",
        ".expo",
        "cli",
      ].includes(basename);
    },
  });
}

/**
 * Remove files/directories from the target
 */
export async function removeFiles(
  targetDir: string,
  files: string[],
): Promise<void> {
  for (const file of files) {
    const fullPath = path.join(targetDir, file);
    if (await fs.exists(fullPath)) {
      await fs.remove(fullPath);
    }
  }
}

/**
 * Apply feature toggles to modify files
 */
export async function applyFeatureToggles(
  targetDir: string,
  configs: FeatureToggleConfig[],
): Promise<void> {
  for (const config of configs) {
    // Remove dependencies from package.json
    if (config.dependenciesToRemove.length > 0) {
      const pkgPath = path.join(targetDir, "package.json");
      if (await fs.exists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        for (const dep of config.dependenciesToRemove) {
          delete pkg.dependencies?.[dep];
          delete pkg.devDependencies?.[dep];
        }
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      }
    }

    // Remove providers from providers/index.tsx
    if (config.providersToRemove.length > 0) {
      const providersPath = path.join(
        targetDir,
        "src/components/providers/index.tsx",
      );
      if (await fs.exists(providersPath)) {
        let content = await fs.readFile(providersPath, "utf-8");
        for (const provider of config.providersToRemove) {
          // Remove import line
          const importRegex = new RegExp(
            `import.*${provider}.*from.*;\n?`,
            "g",
          );
          content = content.replace(importRegex, "");
          // Remove provider wrapper (opening and closing tags)
          const openTagRegex = new RegExp(`\\s*<${provider}>\\s*\n?`, "g");
          const closeTagRegex = new RegExp(`\\s*</${provider}>\\s*\n?`, "g");
          content = content.replace(openTagRegex, "\n");
          content = content.replace(closeTagRegex, "\n");
        }
        await fs.writeFile(providersPath, content, "utf-8");
      }
    }

    // Apply file modifications
    for (const fileOp of config.filesToModify) {
      await modifyFile(targetDir, fileOp);
    }
  }
}

/**
 * Modify a single file based on operations
 */
export async function modifyFile(
  targetDir: string,
  operation: FileOperation,
): Promise<void> {
  const filePath = path.join(targetDir, operation.path);
  if (!(await fs.exists(filePath))) return;

  let content = await fs.readFile(filePath, "utf-8");

  for (const mod of operation.modifications ?? []) {
    content = applyModification(content, mod);
  }

  await fs.writeFile(filePath, content, "utf-8");
}

function applyModification(content: string, mod: Modification): string {
  const pattern =
    typeof mod.pattern === "string"
      ? new RegExp(escapeRegex(mod.pattern), "g")
      : mod.pattern;

  switch (mod.type) {
    case "remove-line":
    case "remove-import":
    case "remove-call": {
      // Remove the entire line containing the pattern
      const lines = content.split("\n");
      return lines.filter((line) => !pattern.test(line)).join("\n");
    }
    case "remove-provider": {
      return content.replace(pattern, (match) => {
        // Extract children from provider wrapper
        const inner = match.replace(/<[^>]+>/g, "").trim();
        return inner;
      });
    }
    case "replace": {
      return content.replace(pattern, mod.replacement ?? "");
    }
    default:
      return content;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
