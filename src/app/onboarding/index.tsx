import { SIonicons } from "@components/common/Icons";
import { useTranslation } from "@i18n";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const features = [
    { icon: "shield-checkmark-outline", label: t("onboarding.welcome.features.auth") },
    { icon: "chatbubble-outline", label: t("onboarding.welcome.features.chat") },
    { icon: "card-outline", label: t("onboarding.welcome.features.payments") },
    { icon: "cloud-upload-outline", label: t("onboarding.welcome.features.uploads") },
  ];

  return (
    <View
      className="flex-1 bg-background px-6"
      style={{ paddingTop: insets.top + 24 }}
    >
      {/* Icon */}
      <View className="size-20 bg-primary rounded-3xl items-center justify-center mb-8 shadow-lg">
        <SIonicons size={40} name="rocket" className="text-primary-foreground" />
      </View>

      {/* Title */}
      <Text className="text-4xl font-bold text-default-foreground mb-3">
        {t("onboarding.welcome.title")}
      </Text>
      <Text className="text-lg text-default-500 leading-relaxed mb-10">
        {t("onboarding.welcome.subtitle")}
      </Text>

      {/* Feature pills */}
      <View className="flex-row flex-wrap gap-2">
        {features.map((f) => (
          <View
            key={f.label}
            className="flex-row items-center gap-x-1.5 bg-default-100 rounded-full px-3 py-2"
          >
            <SIonicons size={14} name={f.icon as any} className="text-primary" />
            <Text className="text-default-600 text-xs font-medium">{f.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
