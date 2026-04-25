import { Stack, usePathname, useRouter } from "expo-router";
import { View } from "react-native";
import { useOnboarding } from "@contexts/onboarding-context";
import { OnboardingButton } from "@components/onboarding/OnboardingButton";
import { StepHeader } from "@components/onboarding/StepHeader";
import { useTranslation } from "@i18n";
import useAuthManage from "@stores/auth.zustand";

const TOTAL_STEPS = 2;

export default function OnboardingLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOnboardingDone } = useOnboarding();
  const { t } = useTranslation();
  const isLogin = useAuthManage((s) => s.isLogin);

  const isSetup = pathname.includes("setup");
  const currentStep = isSetup ? 2 : 1;

  const handlePress = () => {
    if (isSetup) {
      setOnboardingDone(true);
      // If already logged in (e.g. session restored), skip login screen entirely
      router.replace(isLogin ? "/(tabs)" : "/(auth)/login");
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
        label={isSetup ? t("onboarding.getStarted") : t("onboarding.next")}
        onPress={handlePress}
      />
    </View>
  );
}
