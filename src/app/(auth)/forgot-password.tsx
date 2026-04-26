import { forgotPasswordAPI } from "@api/auth";
import { SIonicons } from "@components/common/Icons";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import { useTranslation } from "@i18n";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { InputGroup } from "heroui-native/input-group";
import { useToast } from "heroui-native/toast";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export default function ForgotPassword() {
  const { toast } = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        await forgotPasswordAPI(value.email);
      } catch {
        // always show success to avoid email enumeration
      }
      toast.show({
        label: t("auth.forgotPassword.successTitle"),
        variant: "success",
        description: t("auth.forgotPassword.successMessage"),
      });
      router.back();
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
        <View style={{ paddingTop: insets.top + 12 }} className="px-4">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
          >
            <SIonicons
              size={22}
              name="arrow-back"
              className="text-default-foreground"
            />
          </Button>
        </View>

        <View className="px-6 pb-8 pt-6">
          <View className="size-14 bg-primary/10 rounded-2xl items-center justify-center mb-5">
            <SIonicons size={28} name="key-outline" className="text-primary" />
          </View>
          <Text className="text-2xl font-bold text-default-foreground mb-2">
            {t("auth.forgotPassword.title")}
          </Text>
          <Text className="text-default-400 text-sm leading-relaxed">
            {t("auth.forgotPassword.subtitle")}
          </Text>
        </View>

        <View className="px-6 gap-y-4">
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

          <FormButton form={form}>
            <Button.Label>{t("auth.forgotPassword.submit")}</Button.Label>
          </FormButton>
        </View>

        <View className="flex-row justify-center items-center mt-6 gap-x-1">
          <Text className="text-default-500 text-sm">
            {t("auth.forgotPassword.remembered")}
          </Text>
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            <Button.Label className="text-primary font-semibold text-sm">
              {t("auth.forgotPassword.backToSignIn")}
            </Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
