import { Platform } from "react-native";
import {
  usePermissionHandler,
  type PermissionHandlerConfig,
  type PermissionHandlerResult,
} from "react-native-permission-handler";
import {
  Permissions,
  createRNPEngine,
} from "react-native-permission-handler/rnp";
import { createNoopEngine } from "react-native-permission-handler/noop";

const webEngine = createNoopEngine("unavailable");

const notificationRnpEngine = createRNPEngine({ normalizeAndroid: true });

type UsePermissionOptions = Partial<
  Omit<PermissionHandlerConfig, "permission">
>;

export function useCameraPermission(
  options: UsePermissionOptions = {}
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
  options: UsePermissionOptions = {}
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
