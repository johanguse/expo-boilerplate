import { SIonicons } from "@components/common/Icons";
import { useRevenueCat } from "@contexts/revenuecat-context";
import { useTranslation } from "@i18n";
import useAuthManage from "@stores/auth.zustand";
import { type Href, useRouter } from "expo-router";
import { Card } from "heroui-native/card";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
  accent?: string;
  iconColor?: string;
}

function FeatureCard({
  icon,
  title,
  description,
  onPress,
  accent = "bg-primary/10",
  iconColor = "text-primary",
}: FeatureCardProps) {
  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <Card className="p-4 flex-row items-center gap-x-3">
        <View
          className={`size-10 ${accent} rounded-xl items-center justify-center`}
        >
          <SIonicons size={20} name={icon as never} className={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-default-foreground text-sm font-semibold">
            {title}
          </Text>
          <Text className="text-default-500 text-xs mt-0.5 leading-relaxed">
            {description}
          </Text>
        </View>
        <SIonicons
          size={14}
          name="chevron-forward"
          className="text-default-300"
        />
      </Card>
    </Pressable>
  );
}

export default function Index() {
  const user = useAuthManage((s) => s.user);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { presentPaywall, isProUser } = useRevenueCat();

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const STACK_FEATURES = [
    {
      icon: "layers-outline",
      title: t("home.features.router.title"),
      description: t("home.features.router.description"),
      accent: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      icon: "sparkles-outline",
      title: t("home.features.heroui.title"),
      description: t("home.features.heroui.description"),
      accent: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      icon: "flash-outline",
      title: t("home.features.zustand.title"),
      description: t("home.features.zustand.description"),
      accent: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
    },
    {
      icon: "shield-checkmark-outline",
      title: t("home.features.auth.title"),
      description: t("home.features.auth.description"),
      accent: "bg-green-500/10",
      iconColor: "text-green-500",
    },
    {
      icon: "card-outline",
      title: t("home.features.revenuecat.title"),
      description: t("home.features.revenuecat.description"),
      accent: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      icon: "chatbubble-ellipses-outline",
      title: t("home.features.aiChat.title"),
      description: t("home.features.aiChat.description"),
      accent: "bg-pink-500/10",
      iconColor: "text-pink-500",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View
        className="px-4 pb-6 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View>
          <Text className="text-sm text-default-400 mb-1">
            {t("home.greeting")}
          </Text>
          <Text className="text-2xl font-bold text-default-foreground">
            {firstName}
          </Text>
        </View>
        <View className="size-10 bg-primary/10 rounded-2xl items-center justify-center">
          <SIonicons
            size={20}
            name="hand-right-outline"
            className="text-primary"
          />
        </View>
      </View>

      <View className="px-4 mb-6">
        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mb-3">
          {t("home.quickActions")}
        </Text>
        <View className="flex-row gap-x-3">
          <Pressable
            onPress={() => router.push("/chat")}
            className="flex-1 bg-primary rounded-2xl p-5 items-center gap-y-2.5 active:opacity-75"
          >
            <View className="size-10 bg-primary-foreground/10 rounded-xl items-center justify-center">
              <SIonicons
                size={22}
                name="chatbubble-ellipses"
                className="text-primary-foreground"
              />
            </View>
            <Text className="text-primary-foreground font-semibold text-sm">
              {t("home.startChat")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/profile/edit" as Href)}
            className="flex-1 bg-default-100 rounded-2xl p-5 items-center gap-y-2.5 active:bg-default-200"
          >
            <View className="size-10 bg-default-200 rounded-xl items-center justify-center">
              <SIonicons
                size={22}
                name="person-circle-outline"
                className="text-default-600"
              />
            </View>
            <Text className="text-default-600 font-semibold text-sm">
              {t("home.editProfile")}
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="px-4 mb-6">
        <Pressable
          onPress={() => presentPaywall().catch(() => {})}
          className="bg-amber-500 rounded-2xl p-4 flex-row items-center gap-x-4 active:opacity-80"
        >
          <View className="size-10 bg-white/20 rounded-xl items-center justify-center">
            <SIonicons size={22} name="star" className="text-white" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-sm">
              {t("home.tryPro")}
            </Text>
            <Text className="text-amber-100 text-xs mt-0.5">
              {t("home.tryProDesc")}
            </Text>
          </View>
          <View className="bg-white/20 rounded-full px-2.5 py-1">
            <Text className="text-white text-xs font-semibold">
              {isProUser ? "Pro ✓" : "Demo"}
            </Text>
          </View>
        </Pressable>
      </View>

      <View className="px-4">
        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mb-3">
          {t("home.whatsIncluded")}
        </Text>
        <View className="gap-y-2">
          {STACK_FEATURES.map((item) => (
            <FeatureCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              accent={item.accent}
              iconColor={item.iconColor}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
