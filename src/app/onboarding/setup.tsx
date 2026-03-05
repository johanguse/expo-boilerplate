import { Card } from "heroui-native/card";
import { View, Text } from "react-native";

export default function SetupScreen() {
  return (
    <View className="flex-1 bg-background px-6" style={{ paddingTop: 40 }}>
      <View className="flex-1">
        <Text className="text-3xl font-bold text-foreground mb-2">
          You're all set!
        </Text>
        <Text className="text-lg text-default-500 mb-8">
          Here's what's included in your app.
        </Text>

        <View className="gap-4">
          <Card className="p-4 border border-default-200">
            <View className="flex-row items-center gap-4">
              <Text className="text-2xl">🔐</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">
                  Authentication
                </Text>
                <Text className="text-sm text-default-500">
                  Login, signup & password reset via FastAPI
                </Text>
              </View>
            </View>
          </Card>

          <Card className="p-4 border border-default-200">
            <View className="flex-row items-center gap-4">
              <Text className="text-2xl">💳</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Payments</Text>
                <Text className="text-sm text-default-500">
                  Ready with RevenueCat integration
                </Text>
              </View>
            </View>
          </Card>

          <Card className="p-4 border border-default-200">
            <View className="flex-row items-center gap-4">
              <Text className="text-2xl">✨</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">
                  HeroUI Native
                </Text>
                <Text className="text-sm text-default-500">
                  Premium component library
                </Text>
              </View>
            </View>
          </Card>

          <Card className="p-4 border border-default-200">
            <View className="flex-row items-center gap-4">
              <Text className="text-2xl">🌪️</Text>
              <View className="flex-1">
                <Text className="font-semibold text-foreground">Uniwind</Text>
                <Text className="text-sm text-default-500">
                  Universal styling with Tailwind CSS
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </View>
    </View>
  );
}
