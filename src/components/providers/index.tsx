import "global.css";

import {
  HeroUINativeConfig,
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

export default function AppProvider({ children }: Readonly<AppProviderProps>) {
  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <HeroUINativeProvider config={config}>
          <ThemeProviderComponent>{children}</ThemeProviderComponent>
        </HeroUINativeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
