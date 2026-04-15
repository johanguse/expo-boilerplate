import { SIonicons } from "@components/common/Icons";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import useAppForm from "@hooks/form.hook";
import { forgotPasswordAPI } from "@services/api/auth";
import { Button } from "heroui-native/button";
import { InputGroup } from "heroui-native/input-group";
import { useToast } from "heroui-native/toast";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { email, object } from "zod";
import { useRouter } from "expo-router";

const validationSchema = object({
  email: email("Invalid email address").nonempty("Email is required"),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const Form = useAppForm({
    defaultValues: { email: "" },
    validators: { onChange: validationSchema },
    onSubmit: async ({ value }) => {
      try {
        await forgotPasswordAPI(value.email);
      } catch {}
      // Always show success to prevent email enumeration
      toast.show({
        label: "Email sent",
        variant: "success",
        description: "If that account exists, you'll receive reset instructions.",
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
        {/* Back button */}
        <View style={{ paddingTop: insets.top + 12 }} className="px-4">
          <Button isIconOnly variant="ghost" size="sm" onPress={() => router.back()}>
            <SIonicons size={22} name="arrow-back" className="text-default-foreground" />
          </Button>
        </View>

        {/* Header */}
        <View className="px-6 pb-8 pt-6">
          <View className="size-14 bg-primary/10 rounded-2xl items-center justify-center mb-5">
            <SIonicons size={28} name="key-outline" className="text-primary" />
          </View>
          <Text className="text-2xl font-bold text-default-foreground mb-2">
            Reset password
          </Text>
          <Text className="text-default-400 text-sm leading-relaxed">
            Enter your email and we'll send you instructions to reset your password.
          </Text>
        </View>

        {/* Form */}
        <View className="px-6 gap-y-4">
          <Form.AppField name="email">
            {() => (
              <FormInput
                label="Email"
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
          </Form.AppField>

          <Form.AppForm>
            <FormButton>
              <Button.Label>Send Reset Link</Button.Label>
            </FormButton>
          </Form.AppForm>
        </View>

        <View className="flex-row justify-center items-center mt-6 gap-x-1">
          <Text className="text-default-500 text-sm">Remembered it?</Text>
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            <Button.Label className="text-primary font-semibold text-sm">
              Back to sign in
            </Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
