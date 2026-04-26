import { changePasswordAPI } from "@api/auth";
import { SIonicons } from "@components/common/Icons";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import { useTranslation } from "@i18n";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { InputGroup } from "heroui-native/input-group";
import { useToast } from "heroui-native/toast";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ChangePassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        await changePasswordAPI(value.currentPassword, value.newPassword);
        toast.show({
          label: t("changePassword.successTitle"),
          variant: "success",
          description: t("changePassword.successMessage"),
        });
        router.back();
      } catch (err: unknown) {
        const e = err as { detail?: string; message?: string };
        toast.show({
          label: t("changePassword.errorTitle"),
          variant: "danger",
          description:
            e?.detail ?? e?.message ?? t("changePassword.errorTitle"),
        });
      }
    },
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
          {t("changePassword.title")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-start gap-x-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-2">
          <SIonicons
            size={18}
            name="information-circle-outline"
            className="text-primary mt-0.5"
          />
          <Text className="flex-1 text-sm text-default-600 leading-relaxed">
            Use at least 8 characters. After updating, you will remain signed in
            on this device.
          </Text>
        </View>

        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mt-1 mb-1">
          {t("changePassword.current")}
        </Text>

        <form.Field name="currentPassword">
          {(field) => (
            <FormInput
              field={field}
              label={t("changePassword.current")}
              autoCapitalize="none"
              secureTextEntry={!showCurrent}
            >
              <InputGroup.Prefix isDecorative>
                <SIonicons
                  size={18}
                  name="lock-closed-outline"
                  className="text-default-400"
                />
              </InputGroup.Prefix>
              <InputGroup.Suffix>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => setShowCurrent(!showCurrent)}
                >
                  <SIonicons
                    size={18}
                    name={showCurrent ? "eye" : "eye-off"}
                    className="text-default-400"
                  />
                </Button>
              </InputGroup.Suffix>
            </FormInput>
          )}
        </form.Field>

        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mt-4 mb-1">
          {t("changePassword.new")}
        </Text>

        <form.Field name="newPassword">
          {(field) => (
            <FormInput
              field={field}
              label={t("changePassword.new")}
              autoCapitalize="none"
              secureTextEntry={!showNew}
            >
              <InputGroup.Prefix isDecorative>
                <SIonicons
                  size={18}
                  name="key-outline"
                  className="text-default-400"
                />
              </InputGroup.Prefix>
              <InputGroup.Suffix>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => setShowNew(!showNew)}
                >
                  <SIonicons
                    size={18}
                    name={showNew ? "eye" : "eye-off"}
                    className="text-default-400"
                  />
                </Button>
              </InputGroup.Suffix>
            </FormInput>
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => (
            <FormInput
              field={field}
              label={t("changePassword.confirm")}
              autoCapitalize="none"
              secureTextEntry={!showConfirm}
            >
              <InputGroup.Prefix isDecorative>
                <SIonicons
                  size={18}
                  name="key-outline"
                  className="text-default-400"
                />
              </InputGroup.Prefix>
              <InputGroup.Suffix>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  <SIonicons
                    size={18}
                    name={showConfirm ? "eye" : "eye-off"}
                    className="text-default-400"
                  />
                </Button>
              </InputGroup.Suffix>
            </FormInput>
          )}
        </form.Field>

        <View className="mt-4">
          <FormButton form={form}>
            <Button.Label>{t("changePassword.submit")}</Button.Label>
          </FormButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
