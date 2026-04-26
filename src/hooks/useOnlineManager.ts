import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { useEffect } from "react";

/**
 * Keeps TanStack Query's onlineManager in sync with the device's
 * actual network state via expo-network.
 *
 * Call once in the root provider / layout.
 *
 * @see https://tanstack.com/query/v5/docs/framework/react/react-native#online-status-management
 */
export function useOnlineManager() {
  useEffect(() => {
    let initialised = false;

    const eventSubscription = Network.addNetworkStateListener((state) => {
      initialised = true;
      onlineManager.setOnline(!!state.isConnected);
    });

    Network.getNetworkStateAsync()
      .then((state) => {
        if (!initialised) {
          onlineManager.setOnline(!!state.isConnected);
        }
      })
      .catch(() => {
        // getNetworkStateAsync can reject on some platforms/SDK versions
      });

    return eventSubscription.remove;
  }, []);
}
