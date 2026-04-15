import { SIonicons } from "@components/common/Icons";
import useAuthManage from "@services/zustand/auth.zustand";
import { Card } from "heroui-native/card";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind, Uniwind } from "uniwind";
import Constants from "expo-constants";

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  destructive,
}: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 active:bg-default-50"
    >
      <View
        className={`size-8 rounded-xl items-center justify-center mr-3 ${
          destructive ? "bg-danger/10" : "bg-default-100"
        }`}
      >
        <SIonicons
          size={16}
          name={icon as any}
          className={destructive ? "text-danger" : "text-default-600"}
        />
      </View>
      <Text
        className={`flex-1 text-sm font-medium ${
          destructive ? "text-danger" : "text-default-foreground"
        }`}
      >
        {label}
      </Text>
      {value && (
        <Text className="text-sm text-default-400 mr-2">{value}</Text>
      )}
      {rightElement}
      {onPress && !rightElement && (
        <SIonicons size={16} name="chevron-forward" className="text-default-300" />
      )}
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-default-100 mx-4" />;
}

export default function SettingsScreen() {
  const user = useAuthManage((s) => s.user);
  const signOut = useAuthManage((s) => s.signOut);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();

  const isDark = theme === "dark";
  const version = Constants.expoConfig?.version ?? "1.0.0";

  function handleThemeToggle() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Uniwind.setTheme(isDark ? "light" : "dark");
  }

  function handleSignOut() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    signOut();
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Header */}
      <View className="px-4 pb-6" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-2xl font-bold text-default-foreground">Settings</Text>
      </View>

      {/* Account */}
      <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest px-4 mb-2">
        Account
      </Text>
      <Card className="mx-4 mb-6 overflow-hidden p-0">
        <SettingsRow
          icon="person-outline"
          label="Edit Profile"
          onPress={() => router.push("/profile/edit" as any)}
        />
        <Divider />
        <SettingsRow
          icon="mail-outline"
          label="Email"
          value={user?.email ?? "—"}
        />
        <Divider />
        <SettingsRow
          icon="shield-checkmark-outline"
          label="Account Status"
          value={user?.is_verified ? "Verified" : "Unverified"}
        />
      </Card>

      {/* Appearance */}
      <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest px-4 mb-2">
        Appearance
      </Text>
      <Card className="mx-4 mb-6 overflow-hidden p-0">
        <SettingsRow
          icon={isDark ? "moon" : "sunny-outline"}
          label="Dark Mode"
          rightElement={
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColorOnClassName="accent-primary"
              trackColorOffClassName="accent-default-300"
              thumbColorClassName="accent-white"
              ios_backgroundColorClassName="accent-default-200"
            />
          }
        />
      </Card>

      {/* About */}
      <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest px-4 mb-2">
        About
      </Text>
      <Card className="mx-4 mb-6 overflow-hidden p-0">
        <SettingsRow
          icon="information-circle-outline"
          label="Version"
          value={version}
        />
        <Divider />
        <SettingsRow
          icon="document-text-outline"
          label="Privacy Policy"
          onPress={() => {}}
        />
        <Divider />
        <SettingsRow
          icon="reader-outline"
          label="Terms of Service"
          onPress={() => {}}
        />
      </Card>

      {/* Sign out */}
      <Card className="mx-4 overflow-hidden p-0">
        <SettingsRow
          icon="log-out-outline"
          label="Sign Out"
          onPress={handleSignOut}
          destructive
        />
      </Card>
    </ScrollView>
  );
}
