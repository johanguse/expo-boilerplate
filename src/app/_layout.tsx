// i18n must be imported first — side-effect initializes i18next before any screen
import "@i18n";
import AppProvider from "@components/providers";
import { useOnboarding } from "@contexts/onboarding-context";
import { initFirebase } from "@lib/firebase";
import { ReactQueryProvider } from "@lib/react-query";
import useAuthManage from "@stores/auth.zustand";
import { Redirect, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

initFirebase();

export const unstable_settings = {
  anchor: "(drawer)",
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

  // Logged-in users must never sit on onboarding or auth screens —
  // the navigator can fall back there when Stack.Protected unmounts (auth).
  if (
    isLogin &&
    (pathname.startsWith("/onboarding") || pathname.startsWith("/(auth)"))
  ) {
    return <Redirect href="/" />;
  }

  // Redirect to onboarding if not completed
  if (!isLogin && !onboardingDone && !pathname.startsWith("/onboarding")) {
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
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ReactQueryProvider>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </ReactQueryProvider>
  );
}
