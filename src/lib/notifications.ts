import notifee, { AndroidImportance } from "react-native-notify-kit";

export async function setupNotificationChannels() {
  await notifee.createChannel({
    id: "default",
    name: "General",
    importance: AndroidImportance.HIGH,
  });

  await notifee.createChannel({
    id: "alerts",
    name: "Alerts",
    importance: AndroidImportance.HIGH,
    sound: "default",
  });
}

export async function displayLocalNotification(title: string, body: string) {
  await notifee.displayNotification({
    title,
    body,
    android: { channelId: "default", pressAction: { id: "default" } },
  });
}
