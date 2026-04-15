import AppProvider from "@components/providers";
import useAuthManage from "@services/zustand/auth.zustand";
import { Redirect, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { useOnboarding } from "@contexts/onboarding-context";
import { ActivityIndicator, View } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

configureReanimatedLogger({
  strict: false,
  level: ReanimatedLogLevel.warn,
});

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

function AppLayout() {
  const isLogin = useAuthManage((state) => state.isLogin);
  const isLoading = useAuthManage((state) => state.isLoading);
  const initialize = useAuthManage((state) => state.initialize);
  const { onboardingDone } = useOnboarding();
  const pathname = usePathname();

  useEffect(() => {
    initialize();
  }, []);

  // Show loading while checking auth token
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect to onboarding if not completed
  if (!onboardingDone && !pathname.startsWith("/onboarding")) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <>
      <StatusBar animated />
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Protected guard={!isLogin}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isLogin}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
