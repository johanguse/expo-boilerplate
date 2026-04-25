import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import type { AppStateStatus } from "react-native";
import { focusManager } from "@tanstack/react-query";

/**
 * Tells TanStack Query when the app returns to the foreground so it
 * can refetch stale queries automatically.
 *
 * On web, window focus events are handled natively by the library,
 * so we only set focusManager for native platforms.
 *
 * Call once in the root provider / layout.
 *
 * @see https://tanstack.com/query/v5/docs/framework/react/react-native#refetch-on-app-focus
 */
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export function useAppFocusRefetch() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);
}
