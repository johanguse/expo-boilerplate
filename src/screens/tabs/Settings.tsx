import { SIonicons } from "@components/common/Icons";
import { changeLanguage, supportedLanguages, useTranslation } from "@i18n";
import useAuthManage from "@services/zustand/auth.zustand";
import { Card } from "heroui-native/card";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
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
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const isDark = theme === "dark";
  const currentLang = i18n.language as (typeof supportedLanguages)[number];

  const FLAG: Record<string, string> = { en: "🇺🇸", es: "🇪🇸", pt: "🇧🇷" };
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
        <Text className="text-2xl font-bold text-default-foreground">{t("settings.title")}</Text>
      </View>

      {/* Account */}
      <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest px-4 mb-2">
        {t("settings.account")}
      </Text>
      <Card className="mx-4 mb-6 overflow-hidden p-0">
        <SettingsRow
          icon="person-outline"
          label={t("settings.editProfile")}
          onPress={() => router.push("/profile/edit" as any)}
        />
        <Divider />
        <SettingsRow
          icon="mail-outline"
          label={t("settings.email")}
          value={user?.email ?? "—"}
        />
        <Divider />
        <SettingsRow
          icon="key-outline"
          label={t("settings.changePassword")}
          onPress={() => router.push("/profile/change-password" as any)}
        />
        <Divider />
        <SettingsRow
          icon="shield-checkmark-outline"
          label={t("settings.security")}
          value={user?.is_verified ? t("settings.verified") : t("settings.unverified")}
          onPress={() => router.push("/profile/security" as any)}
        />
      </Card>

      {/* Appearance */}
      <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest px-4 mb-2">
        {t("settings.appearance")}
      </Text>
      <Card className="mx-4 mb-6 overflow-hidden p-0">
        <SettingsRow
          icon={isDark ? "moon" : "sunny-outline"}
          label={t("settings.darkMode")}
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
        <Divider />
        <SettingsRow
          icon="language-outline"
          label={t("common.language")}
          value={`${FLAG[currentLang] ?? "🌐"} ${t(`languages.${currentLang}` as any)}`}
          onPress={() => setLangOpen(true)}
        />
      </Card>

      {/* Language picker modal */}
      <Modal
        visible={langOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center px-8"
          onPress={() => setLangOpen(false)}
        >
          <Pressable
            className="w-full bg-background rounded-2xl overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="px-4 pt-4 pb-2">
              <Text className="text-default-foreground font-semibold text-base">
                {t("common.language")}
              </Text>
            </View>

            {supportedLanguages.map((lang, i) => {
              const isSelected = lang === currentLang;
              const isLast = i === supportedLanguages.length - 1;
              return (
                <Pressable
                  key={lang}
                  onPress={() => {
                    changeLanguage(lang);
                    setLangOpen(false);
                  }}
                  className={`flex-row items-center px-4 py-3.5 active:bg-default-100 ${
                    !isLast ? "border-b border-default-100" : ""
                  }`}
                >
                  <Text className="text-xl mr-3">{FLAG[lang] ?? "🌐"}</Text>
                  <Text
                    className={`flex-1 text-sm ${
                      isSelected ? "text-primary font-semibold" : "text-default-foreground"
                    }`}
                  >
                    {t(`languages.${lang}` as any)}
                  </Text>
                  {isSelected && (
                    <SIonicons size={16} name="checkmark" className="text-primary" />
                  )}
                </Pressable>
              );
            })}

            <View className="h-4" />
          </Pressable>
        </Pressable>
      </Modal>

      {/* About */}
      <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest px-4 mb-2">
        {t("settings.about")}
      </Text>
      <Card className="mx-4 mb-6 overflow-hidden p-0">
        <SettingsRow icon="information-circle-outline" label={t("settings.version")} value={version} />
        <Divider />
        <SettingsRow icon="document-text-outline" label={t("settings.privacyPolicy")} onPress={() => {}} />
        <Divider />
        <SettingsRow icon="reader-outline" label={t("settings.termsOfService")} onPress={() => {}} />
      </Card>

      {/* Sign out */}
      <Card className="mx-4 overflow-hidden p-0">
        <SettingsRow
          icon="log-out-outline"
          label={t("settings.signOut")}
          onPress={handleSignOut}
          destructive
        />
      </Card>
    </ScrollView>
  );
}
