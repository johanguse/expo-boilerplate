/**
 * Tests for CLI feature toggle configurations
 */

import { getFeatureToggle } from "../feature-toggles";

describe("Feature Toggles", () => {
  describe("getFeatureToggle", () => {
    it("should return api-backend toggle config", () => {
      const config = getFeatureToggle("api-backend");

      expect(config.filesToRemove).toContain("src/api");
      expect(config.filesToRemove).toContain("src/config/api.ts");
    });

    it("should return onboarding toggle config", () => {
      const config = getFeatureToggle("onboarding");

      expect(config.filesToRemove).toContain(
        "src/contexts/onboarding-context.tsx",
      );
      expect(config.filesToRemove).toContain("src/app/onboarding");
      expect(config.filesToRemove).toContain("src/components/onboarding");
      expect(config.providersToRemove).toContain("OnboardingProvider");
    });

    it("should return revenuecat toggle config", () => {
      const config = getFeatureToggle("revenuecat");

      expect(config.filesToRemove).toContain(
        "src/contexts/revenuecat-context.tsx",
      );
      expect(config.filesToRemove).toContain("src/config/revenuecat.ts");
      expect(config.dependenciesToRemove).toContain("react-native-purchases");
      expect(config.dependenciesToRemove).toContain(
        "react-native-purchases-ui",
      );
      expect(config.providersToRemove).toContain("RevenueCatProvider");
    });

    it("should throw for unknown feature", () => {
      expect(() => getFeatureToggle("unknown")).toThrow(
        "Unknown feature: unknown",
      );
    });
  });
});
