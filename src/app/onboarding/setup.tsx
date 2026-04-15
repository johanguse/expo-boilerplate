import { SIonicons } from "@components/common/Icons";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STACK_ITEMS = [
  {
    icon: "lock-closed-outline",
    color: "bg-blue-500/10",
    iconColor: "text-blue-500",
    title: "Authentication",
    description: "Email/password login, JWT tokens, password reset",
  },
  {
    icon: "chatbubble-ellipses-outline",
    color: "bg-purple-500/10",
    iconColor: "text-purple-500",
    title: "AI Chat",
    description: "Streaming AI responses via OpenRouter + Claude",
  },
  {
    icon: "card-outline",
    color: "bg-green-500/10",
    iconColor: "text-green-500",
    title: "Payments",
    description: "RevenueCat in-app purchases + Stripe on the backend",
  },
  {
    icon: "server-outline",
    color: "bg-orange-500/10",
    iconColor: "text-orange-500",
    title: "FastAPI Backend",
    description: "REST API with SQLAlchemy, Alembic, and more",
  },
];

export default function SetupScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background px-6"
      style={{ paddingTop: insets.top + 24 }}
    >
      <Text className="text-3xl font-bold text-default-foreground mb-2">
        Everything you need
      </Text>
      <Text className="text-default-400 text-base mb-8">
        Your app comes with a complete stack ready to customize.
      </Text>

      <View className="gap-y-3">
        {STACK_ITEMS.map((item) => (
          <View
            key={item.title}
            className="flex-row items-center gap-x-4 p-4 bg-default-50 rounded-2xl border border-default-100"
          >
            <View className={`size-10 ${item.color} rounded-xl items-center justify-center`}>
              <SIonicons size={20} name={item.icon as any} className={item.iconColor} />
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
    </View>
  );
}
