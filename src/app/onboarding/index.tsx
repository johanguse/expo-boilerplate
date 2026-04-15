import { SIonicons } from "@components/common/Icons";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FEATURES = [
  { icon: "shield-checkmark-outline", label: "Secure JWT auth" },
  { icon: "chatbubble-outline", label: "Streaming AI chat" },
  { icon: "card-outline", label: "In-app purchases" },
  { icon: "cloud-upload-outline", label: "File uploads" },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

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
        Expo + FastAPI
      </Text>
      <Text className="text-lg text-default-500 leading-relaxed mb-10">
        A production-ready boilerplate for building mobile apps with an AI-powered backend.
      </Text>

      {/* Feature pills */}
      <View className="flex-row flex-wrap gap-2">
        {FEATURES.map((f) => (
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
