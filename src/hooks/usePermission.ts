import { Platform } from "react-native";
import {
  type PermissionHandlerConfig,
  type PermissionHandlerResult,
  usePermissionHandler,
} from "react-native-permission-handler";
import { createNoopEngine } from "react-native-permission-handler/noop";
import {
  createRNPEngine,
  Permissions,
} from "react-native-permission-handler/rnp";

const webEngine = createNoopEngine("unavailable");

const notificationRnpEngine = createRNPEngine({ normalizeAndroid: true });

type UsePermissionOptions = Partial<
  Omit<PermissionHandlerConfig, "permission">
>;

export function useCameraPermission(
  options: UsePermissionOptions = {},
): PermissionHandlerResult {
  return usePermissionHandler({
    permission: Permissions.CAMERA,
    autoCheck: true,
    recheckOnForeground: false,
    ...options,
    engine: Platform.OS === "web" ? webEngine : options.engine,
  });
}

export function useNotificationPermission(
  options: UsePermissionOptions = {},
): PermissionHandlerResult {
  return usePermissionHandler({
    permission: Permissions.NOTIFICATIONS,
    autoCheck: true,
    recheckOnForeground: true,
    ...options,
    engine:
      Platform.OS === "web"
        ? webEngine
        : (options.engine ?? notificationRnpEngine),
  });
}
