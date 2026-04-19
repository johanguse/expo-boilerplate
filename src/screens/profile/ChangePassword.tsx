import { SIonicons } from "@components/common/Icons";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import useAppForm from "@hooks/form.hook";
import { useTranslation } from "@i18n";
import { changePasswordAPI } from "@services/api/auth";
import { Button } from "heroui-native/button";
import { InputGroup } from "heroui-native/input-group";
import { useToast } from "heroui-native/toast";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { object, string } from "zod";

const validationSchema = object({
  currentPassword: string().nonempty("Current password is required"),
  newPassword: string()
    .min(8, "Must be at least 8 characters")
    .nonempty("New password is required"),
  confirmPassword: string().nonempty("Please confirm your password"),
}).check((ctx) => {
  if (ctx.value.newPassword !== ctx.value.confirmPassword) {
    ctx.issues.push({
      code: "custom",
      input: ctx.value.confirmPassword,
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });
  }
});

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const Form = useAppForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: { onChange: validationSchema },
    onSubmit: async ({ value }) => {
      try {
        await changePasswordAPI(value.currentPassword, value.newPassword);
        toast.show({
          label: t("changePassword.successTitle"),
          variant: "success",
          description: t("changePassword.successMessage"),
        });
        router.back();
      } catch (err: any) {
        toast.show({
          label: t("changePassword.errorTitle"),
          variant: "danger",
          description: err?.detail ?? err?.message ?? t("changePassword.errorTitle"),
        });
      }
    },
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        className="flex-row items-center gap-x-3 px-4 border-b border-default-100"
        style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
      >
        <Button isIconOnly variant="ghost" size="sm" onPress={() => router.back()}>
          <SIonicons size={20} name="arrow-back" className="text-default-foreground" />
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
        {/* Info banner */}
        <View className="flex-row items-start gap-x-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-2">
          <SIonicons size={18} name="information-circle-outline" className="text-primary mt-0.5" />
          <Text className="flex-1 text-sm text-default-600 leading-relaxed">
            Use at least 8 characters. After updating, you will remain signed in on this device.
          </Text>
        </View>

        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mt-1 mb-1">
          {t("changePassword.current")}
        </Text>

        <Form.AppField name="currentPassword">
          {() => (
            <FormInput
              label={t("changePassword.current")}
              autoCapitalize="none"
              secureTextEntry={!showCurrent}
            >
              <InputGroup.Prefix isDecorative>
                <SIonicons size={18} name="lock-closed-outline" className="text-default-400" />
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
        </Form.AppField>

        <Text className="text-xs font-semibold text-default-400 uppercase tracking-widest mt-4 mb-1">
          {t("changePassword.new")}
        </Text>

        <Form.AppField name="newPassword">
          {() => (
            <FormInput
              label={t("changePassword.new")}
              autoCapitalize="none"
              secureTextEntry={!showNew}
            >
              <InputGroup.Prefix isDecorative>
                <SIonicons size={18} name="key-outline" className="text-default-400" />
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
        </Form.AppField>

        <Form.AppField name="confirmPassword">
          {() => (
            <FormInput
              label={t("changePassword.confirm")}
              autoCapitalize="none"
              secureTextEntry={!showConfirm}
            >
              <InputGroup.Prefix isDecorative>
                <SIonicons size={18} name="key-outline" className="text-default-400" />
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
        </Form.AppField>

        <View className="mt-4">
          <Form.AppForm>
            <FormButton>
              <Button.Label>{t("changePassword.submit")}</Button.Label>
            </FormButton>
          </Form.AppForm>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
