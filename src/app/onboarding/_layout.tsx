import { Stack, usePathname, useRouter } from "expo-router";
import { View } from "react-native";
import { useOnboarding } from "@contexts/onboarding-context";
import { useRevenueCat } from "@contexts/revenuecat-context";
import { OnboardingButton } from "@components/onboarding/OnboardingButton";
import { StepHeader } from "@components/onboarding/StepHeader";

const TOTAL_STEPS = 2;

export default function OnboardingLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOnboardingDone } = useOnboarding();
  const { presentPaywall, isProUser } = useRevenueCat();

  const isSetup = pathname.includes("setup");
  const currentStep = isSetup ? 2 : 1;

  const handlePress = async () => {
    if (isSetup) {
      setOnboardingDone(true);

      if (!isProUser) {
        try {
          await presentPaywall();
        } catch (err) {
          console.error("Paywall failed:", err);
        }
      }

      router.replace("/(auth)/login");
    } else {
      router.push("/onboarding/setup");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StepHeader currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <View className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            animationDuration: 200,
          }}
        />
      </View>

      <OnboardingButton
        label={isSetup ? "Get Started!" : "Next"}
        onPress={handlePress}
      />
    </View>
  );
}
