import { View, Text } from "react-native";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-background px-6" style={{ paddingTop: 40 }}>
      <View className="flex-1 items-center">
        <View className="size-20 bg-primary/10 rounded-3xl items-center justify-center mb-8">
          <Text className="text-4xl">🚀</Text>
        </View>

        <Text className="text-4xl font-bold text-foreground text-center mb-4">
          Welcome
        </Text>

        <Text className="text-lg text-default-500 text-center leading-relaxed">
          Build beautiful mobile apps powered by your FastAPI backend — with
          authentication, onboarding, and in-app purchases ready to go.
        </Text>
      </View>
    </View>
  );
}
