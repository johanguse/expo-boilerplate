import { SIonicons } from "@components/common/Icons";
import LanguageSwitcher from "@components/common/LanguageSwitcher";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import { useTranslation } from "@i18n";
import useAuthManage from "@stores/auth.zustand";
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

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const signIn = useAuthManage((state) => state.signIn);
  const { toast } = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPass, setShowPass] = useState(false);
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      try {
        await signIn(value.email, value.password);
      } catch (error: unknown) {
        const err = error as { detail?: string; message?: string };
        toast.show({
          label: t("auth.login.errorTitle"),
          variant: "danger",
          description:
            err?.detail ?? err?.message ?? t("auth.login.errorTitle"),
        });
      }
    },
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="grow"
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="items-center px-6 pb-8"
          style={{ paddingTop: insets.top + 48 }}
        >
          <View className="size-16 bg-primary rounded-2xl items-center justify-center mb-5 shadow-lg">
            <SIonicons
              size={32}
              name="rocket"
              className="text-primary-foreground"
            />
          </View>
          <Text className="text-2xl font-bold text-default-foreground">
            {t("auth.login.title")}
          </Text>
          <Text className="text-default-400 text-sm mt-1">
            {t("auth.login.subtitle")}
          </Text>
        </View>

        <View className="px-6 gap-y-3">
          <form.Field name="email">
            {(field) => (
              <FormInput
                field={field}
                label={t("common.email")}
                autoCapitalize="none"
                keyboardType="email-address"
              >
                <InputGroup.Prefix isDecorative>
                  <SIonicons
                    size={18}
                    name="mail-outline"
                    className="text-default-400"
                  />
                </InputGroup.Prefix>
              </FormInput>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <FormInput
                field={field}
                label={t("common.password")}
                autoCapitalize="none"
                secureTextEntry={!showPass}
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
                    onPress={() => setShowPass(!showPass)}
                  >
                    <SIonicons
                      size={18}
                      name={showPass ? "eye" : "eye-off"}
                      className="text-default-400"
                    />
                  </Button>
                </InputGroup.Suffix>
              </FormInput>
            )}
          </form.Field>

          <Button
            variant="ghost"
            className="self-end -mx-3 -mt-1"
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Button.Label className="text-primary text-sm">
              {t("auth.login.forgotPassword")}
            </Button.Label>
          </Button>

          <FormButton form={form}>
            <Button.Label>{t("auth.login.submit")}</Button.Label>
          </FormButton>
        </View>

        <View className="items-center mt-4">
          <LanguageSwitcher />
        </View>

        <View className="flex-row justify-center items-center mt-4 pb-8 gap-x-1">
          <Text className="text-default-500 text-sm">
            {t("auth.login.noAccount")}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.push("/(auth)/signup")}
          >
            <Button.Label className="text-primary font-semibold text-sm">
              {t("auth.login.signUp")}
            </Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
