import { createMMKV } from "react-native-mmkv";

export const storage_instance = createMMKV();

export const StorageKeys = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_PROFILE: "user_profile",
  ONBOARDING_DONE: "onboarding_done",
  THEME_PREFERENCE: "theme_preference",
  CHAT_HISTORY: "chat_history",
} as const;

export const storage = {
  set: (key: string, value: string | boolean | number) => {
    try {
      storage_instance.set(key, value);
    } catch (e) {
      console.error("Error saving data", e);
    }
  },
  getString: (key: string): string | undefined => {
    try {
      return storage_instance.getString(key);
    } catch (e) {
      console.error("Error reading data", e);
      return undefined;
    }
  },
  getBoolean: (key: string): boolean | undefined => {
    try {
      return storage_instance.getBoolean(key);
    } catch (e) {
      console.error("Error reading data", e);
      return undefined;
    }
  },
  remove: (key: string) => {
    try {
      storage_instance.remove(key);
    } catch (e) {
      console.error("Error removing data", e);
    }
  },
};
