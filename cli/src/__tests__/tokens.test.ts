/**
 * Tests for CLI token generation and replacement
 */

import { generateTokenMap } from "../tokens";

describe("Token Generation", () => {
  it("should generate correct token map from project name and bundle ID", () => {
    const tokens = generateTokenMap("my-cool-app", "com.company.mycoolapp");

    expect(tokens).toEqual({
      projectName: "my-cool-app",
      displayName: "My Cool App",
      iosBundleIdentifier: "com.company.mycoolapp",
      androidPackage: "com.company.mycoolapp",
      scheme: "mycoolapp",
    });
  });

  it("should handle single-word project names", () => {
    const tokens = generateTokenMap("app", "com.company.app");

    expect(tokens.displayName).toBe("App");
    expect(tokens.scheme).toBe("app");
  });

  it("should handle hyphenated names for display name", () => {
    const tokens = generateTokenMap(
      "super-mega-app",
      "com.example.supermegaapp",
    );

    expect(tokens.displayName).toBe("Super Mega App");
    expect(tokens.scheme).toBe("supermegaapp");
  });
});
