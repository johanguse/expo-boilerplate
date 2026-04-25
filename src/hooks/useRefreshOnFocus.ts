import React from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Refetch all active stale queries when a React Navigation screen
 * gains focus (e.g. navigating back to a tab).
 *
 * Skips the first focus event (initial mount) to avoid duplicate fetches.
 *
 * Usage:
 * ```tsx
 * import { useFocusEffect } from "expo-router";
 *
 * function MyScreen() {
 *   useRefreshOnFocus();
 *   // ...
 * }
 * ```
 *
 * @param focusEffect  Pass `useFocusEffect` from expo-router / react-navigation
 *
 * @see https://tanstack.com/query/v5/docs/framework/react/react-native#refresh-on-screen-focus
 */
export function useRefreshOnFocus(
  focusEffect: typeof React.useEffect = React.useEffect,
) {
  const queryClient = useQueryClient();
  const firstTimeRef = React.useRef(true);

  focusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      queryClient.refetchQueries({ stale: true, type: "active" });
    }, [queryClient]),
  );
}
