import "global.css";

import { OnboardingProvider } from "@contexts/onboarding-context";
import { RevenueCatProvider } from "@contexts/revenuecat-context";
import { useAppFocusRefetch } from "@hooks/useAppFocusRefetch";
import { useNotifications } from "@hooks/useNotifications";
import { useOnlineManager } from "@hooks/useOnlineManager";
import { useNotificationPermission } from "@hooks/usePermission";
import {
  type HeroUINativeConfig,
  HeroUINativeProvider,
} from "heroui-native/provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import ThemeProviderComponent from "./ThemeProvider";

type AppProviderProps = {
  children: React.ReactNode;
};

const config: HeroUINativeConfig = {
  devInfo: {
    stylingPrinciples: false,
  },
};

/**
 * Notification permission state + FCM token sync (when signed in) + foreground
 * display via notify-kit. Use `permission.request` from UI when you want the
 * system permission dialog.
 */
function PushNotificationsInit() {
  const permission = useNotificationPermission();
  useNotifications(permission);
  return null;
}

export default function AppProvider({ children }: Readonly<AppProviderProps>) {
  // Keep TanStack Query in sync with device network & app focus state
  useOnlineManager();
  useAppFocusRefetch();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <RevenueCatProvider>
          <OnboardingProvider>
            <HeroUINativeProvider config={config}>
              <PushNotificationsInit />
              <ThemeProviderComponent>{children}</ThemeProviderComponent>
            </HeroUINativeProvider>
          </OnboardingProvider>
        </RevenueCatProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
