import AppProvider from "@components/providers";
import useAuthManage from "@services/zustand/auth.zustand";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

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

  return (
    <>
      <StatusBar animated />
      <Stack>
        <Stack.Protected guard={!isLogin}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isLogin}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
