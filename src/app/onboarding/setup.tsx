import { SIonicons, type SIoniconsName } from "@components/common/Icons";
import { useTranslation } from "@i18n";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SetupScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const STACK_ITEMS = [
    {
      icon: "lock-closed-outline",
      color: "bg-blue-500/10",
      iconColor: "text-blue-500",
      title: t("onboarding.setup.auth.title"),
      description: t("onboarding.setup.auth.description"),
    },
    {
      icon: "chatbubble-ellipses-outline",
      color: "bg-purple-500/10",
      iconColor: "text-purple-500",
      title: t("onboarding.setup.chat.title"),
      description: t("onboarding.setup.chat.description"),
    },
    {
      icon: "card-outline",
      color: "bg-green-500/10",
      iconColor: "text-green-500",
      title: t("onboarding.setup.payments.title"),
      description: t("onboarding.setup.payments.description"),
    },
    {
      icon: "server-outline",
      color: "bg-orange-500/10",
      iconColor: "text-orange-500",
      title: t("onboarding.setup.backend.title"),
      description: t("onboarding.setup.backend.description"),
    },
    {
      icon: "language-outline",
      color: "bg-teal-500/10",
      iconColor: "text-teal-500",
      title: t("onboarding.setup.i18n.title"),
      description: t("onboarding.setup.i18n.description"),
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingHorizontal: 24,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl font-bold text-default-foreground mb-2">
        {t("onboarding.setup.title")}
      </Text>
      <Text className="text-default-400 text-base mb-8">
        {t("onboarding.setup.subtitle")}
      </Text>

      <View className="gap-y-3">
        {STACK_ITEMS.map((item) => (
          <View
            key={item.title}
            className="flex-row items-center gap-x-4 p-4 bg-default-50 rounded-2xl border border-default-100"
          >
            <View
              className={`size-10 ${item.color} rounded-xl items-center justify-center`}
            >
              <SIonicons
                size={20}
                name={item.icon as SIoniconsName}
                className={item.iconColor}
              />
            </View>
            <View className="flex-1">
              <Text className="text-default-foreground font-semibold text-sm">
                {item.title}
              </Text>
              <Text className="text-default-400 text-xs mt-0.5 leading-relaxed">
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
