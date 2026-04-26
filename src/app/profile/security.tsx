import { resendVerificationAPI } from "@api/auth";
import { SIonicons } from "@components/common/Icons";
import { useTranslation } from "@i18n";
import useAuthManage from "@stores/auth.zustand";
import * as Haptics from "expo-haptics";
import { type Href, useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { useToast } from "heroui-native/toast";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest px-1 mb-2 mt-2">
      {label}
    </Text>
  );
}

function NavRow({
  icon,
  label,
  description,
  onPress,
  destructive,
}: {
  icon: string;
  label: string;
  description?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
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
          name={icon as never}
          className={destructive ? "text-danger" : "text-default-600"}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-sm font-medium ${
            destructive ? "text-danger" : "text-default-foreground"
          }`}
        >
          {label}
        </Text>
        {description && (
          <Text className="text-xs text-default-400 mt-0.5">{description}</Text>
        )}
      </View>
      <SIonicons
        size={16}
        name="chevron-forward"
        className="text-default-300"
      />
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-default-100 mx-4" />;
}

export default function Security() {
  const user = useAuthManage((s) => s.user);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);

  async function handleResendVerification() {
    if (!user?.email || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    try {
      await resendVerificationAPI(user.email);
      toast.show({
        label: "Email Sent",
        variant: "success",
        description: t("security.resendSuccess"),
      });
    } catch {
      toast.show({
        label: "Error",
        variant: "danger",
        description: t("security.resendError"),
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View
        className="flex-row items-center gap-x-3 px-4 border-b border-default-100"
        style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
      >
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
        >
          <SIonicons
            size={20}
            name="arrow-back"
            className="text-default-foreground"
          />
        </Button>
        <Text className="text-lg font-semibold text-default-foreground flex-1">
          {t("security.title")}
        </Text>
      </View>

      <View className="px-4 pt-6 gap-y-1">
        <SectionHeader label={t("security.emailVerification")} />
        <Card className="overflow-hidden p-0 mb-6">
          <View className="flex-row items-center px-4 py-4 gap-x-3">
            <View
              className={`size-10 rounded-xl items-center justify-center ${
                user?.is_verified ? "bg-success/10" : "bg-warning/10"
              }`}
            >
              <SIonicons
                size={20}
                name={user?.is_verified ? "shield-checkmark" : "shield-outline"}
                className={user?.is_verified ? "text-success" : "text-warning"}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-x-2">
                <Text className="text-sm font-semibold text-default-foreground">
                  {user?.email}
                </Text>
                <View
                  className={`px-2 py-0.5 rounded-full ${
                    user?.is_verified ? "bg-success/10" : "bg-warning/10"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      user?.is_verified ? "text-success" : "text-warning"
                    }`}
                  >
                    {user?.is_verified
                      ? t("settings.verified")
                      : t("settings.unverified")}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-default-400 mt-0.5">
                {user?.is_verified
                  ? t("security.verifiedDesc")
                  : t("security.unverifiedDesc")}
              </Text>
            </View>
          </View>

          {!user?.is_verified && (
            <>
              <Divider />
              <Pressable
                onPress={handleResendVerification}
                disabled={sending}
                className="flex-row items-center px-4 py-3.5 active:bg-default-50"
              >
                <View className="size-8 rounded-xl bg-primary/10 items-center justify-center mr-3">
                  <SIonicons
                    size={16}
                    name="send-outline"
                    className="text-primary"
                  />
                </View>
                <Text className="flex-1 text-sm font-medium text-primary">
                  {sending ? "Sending…" : t("security.resend")}
                </Text>
              </Pressable>
            </>
          )}
        </Card>

        <SectionHeader label={t("settings.changePassword")} />
        <Card className="overflow-hidden p-0 mb-6">
          <NavRow
            icon="key-outline"
            label={t("changePassword.title")}
            description={t("security.changePasswordDesc")}
            onPress={() => router.push("/profile/change-password" as Href)}
          />
        </Card>

        <SectionHeader label={t("security.sessions")} />
        <Card className="overflow-hidden p-0 mb-6">
          <View className="flex-row items-center px-4 py-3.5 gap-x-3">
            <View className="size-8 rounded-xl bg-default-100 items-center justify-center">
              <SIonicons
                size={16}
                name="phone-portrait-outline"
                className="text-default-600"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-default-foreground">
                {t("security.sessionsDesc")}
              </Text>
              <Text className="text-xs text-default-400 mt-0.5">
                {user?.created_at
                  ? `Since ${new Date(user.created_at).toLocaleDateString()}`
                  : "—"}
              </Text>
            </View>
            <View className="size-2 bg-success rounded-full" />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
