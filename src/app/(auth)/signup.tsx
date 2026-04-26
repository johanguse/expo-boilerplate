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

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Signup() {
  const signUp = useAuthManage((state) => state.signUp);
  const { toast } = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    validators: { onSubmit: signupSchema },
    onSubmit: async ({ value }) => {
      try {
        await signUp(value.email, value.password, value.name);
        toast.show({
          label: t("auth.signup.successTitle"),
          variant: "success",
          description: t("auth.signup.successMessage"),
        });
      } catch (error: unknown) {
        const err = error as { detail?: string; message?: string };
        toast.show({
          label: t("auth.signup.errorTitle"),
          variant: "danger",
          description:
            err?.detail ?? err?.message ?? t("auth.signup.errorTitle"),
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
          style={{ paddingTop: insets.top + 40 }}
        >
          <View className="size-16 bg-primary rounded-2xl items-center justify-center mb-5 shadow-lg">
            <SIonicons
              size={32}
              name="rocket"
              className="text-primary-foreground"
            />
          </View>
          <Text className="text-2xl font-bold text-default-foreground">
            {t("auth.signup.title")}
          </Text>
          <Text className="text-default-400 text-sm mt-1">
            {t("auth.signup.subtitle")}
          </Text>
        </View>

        <View className="px-6 gap-y-3">
          <form.Field name="name">
            {(field) => (
              <FormInput
                field={field}
                label={t("auth.signup.fullName")}
                autoCapitalize="words"
              >
                <InputGroup.Prefix isDecorative>
                  <SIonicons
                    size={18}
                    name="person-outline"
                    className="text-default-400"
                  />
                </InputGroup.Prefix>
              </FormInput>
            )}
          </form.Field>

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

          <form.Field name="confirmPassword">
            {(field) => (
              <FormInput
                field={field}
                label={t("auth.signup.confirmPassword")}
                autoCapitalize="none"
                secureTextEntry={!showConfirmPass}
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
                    onPress={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    <SIonicons
                      size={18}
                      name={showConfirmPass ? "eye" : "eye-off"}
                      className="text-default-400"
                    />
                  </Button>
                </InputGroup.Suffix>
              </FormInput>
            )}
          </form.Field>

          <View className="h-1" />

          <FormButton form={form}>
            <Button.Label>{t("auth.signup.submit")}</Button.Label>
          </FormButton>
        </View>

        <View className="items-center mt-4">
          <LanguageSwitcher />
        </View>

        <View className="flex-row justify-center items-center mt-4 pb-8 gap-x-1">
          <Text className="text-default-500 text-sm">
            {t("auth.signup.hasAccount")}
          </Text>
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            <Button.Label className="text-primary font-semibold text-sm">
              {t("auth.signup.signIn")}
            </Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
