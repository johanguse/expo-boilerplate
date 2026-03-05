import "global.css";

import {
  HeroUINativeConfig,
  HeroUINativeProvider,
} from "heroui-native/provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import ThemeProviderComponent from "./ThemeProvider";
import { OnboardingProvider } from "@contexts/onboarding-context";
import { RevenueCatProvider } from "@contexts/revenuecat-context";

type AppProviderProps = {
  children: React.ReactNode;
};

const config: HeroUINativeConfig = {
  devInfo: {
    stylingPrinciples: false,
  },
};

export default function AppProvider({ children }: Readonly<AppProviderProps>) {
  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <RevenueCatProvider>
          <OnboardingProvider>
            <HeroUINativeProvider config={config}>
              <ThemeProviderComponent>{children}</ThemeProviderComponent>
            </HeroUINativeProvider>
          </OnboardingProvider>
        </RevenueCatProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
