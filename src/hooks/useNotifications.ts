import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import messaging, { type RemoteMessage } from "@react-native-firebase/messaging";
import type { PermissionHandlerResult } from "react-native-permission-handler";
import { registerPushToken } from "@api/push";
import { displayLocalNotification, setupNotificationChannels } from "@lib/notifications";
import useAuthManage from "@stores/auth.zustand";

const isNativePush = Platform.OS === "ios" || Platform.OS === "android";

function onForegroundMessage(remoteMessage: RemoteMessage) {
  const data = remoteMessage.data;
  const title =
    remoteMessage.notification?.title ??
    (typeof data?.title === "string" ? data.title : "");
  const body =
    remoteMessage.notification?.body ??
    (typeof data?.body === "string" ? data.body : "");
  if (title.length === 0 && body.length === 0) return;
  void displayLocalNotification(title, body);
}

/**
 * FCM: sync token to the API when the user is signed in and notification
 * permission is granted; show notify-kit local notifications in the foreground
 * for incoming pushes.
 */
export function useNotifications(
  permission: PermissionHandlerResult
): void {
  const isLogin = useAuthManage((s) => s.isLogin);
  const lastSentToken = useRef<string | null>(null);

  useEffect(() => {
    if (!isNativePush) return;
    void setupNotificationChannels();
  }, []);

  useEffect(() => {
    if (!isNativePush || !permission.isGranted) return;
    const unsubscribe = messaging().onMessage(async (msg) => {
      onForegroundMessage(msg);
    });
    return () => {
      unsubscribe();
    };
  }, [permission.isGranted]);

  useEffect(() => {
    if (!isNativePush) return;
    if (!isLogin) {
      lastSentToken.current = null;
      return;
    }
    if (!permission.isGranted) return;

    const sync = async () => {
      try {
        if (Platform.OS === "ios") {
          await messaging().registerDeviceForRemoteMessages();
        }
        const token = await messaging().getToken();
        if (token.length === 0) return;
        if (lastSentToken.current === token) return;
        await registerPushToken(token);
        lastSentToken.current = token;
      } catch (err) {
        if (__DEV__) {
          console.warn("[useNotifications] getToken / register failed", err);
        }
      }
    };

    void sync();

    const unsubscribe = messaging().onTokenRefresh((newToken) => {
      if (newToken.length === 0) return;
      if (!useAuthManage.getState().isLogin) return;
      void (async () => {
        try {
          await registerPushToken(newToken);
          lastSentToken.current = newToken;
        } catch (err) {
          if (__DEV__) {
            console.warn("[useNotifications] onTokenRefresh register failed", err);
          }
        }
      })();
    });

    return () => {
      unsubscribe();
    };
  }, [isLogin, permission.isGranted]);
}
