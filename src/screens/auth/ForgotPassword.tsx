import { SIonicons } from "@components/common/Icons";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import useAppForm from "@hooks/form.hook";
import { forgotPasswordAPI } from "@services/api/auth";
import { Button } from "heroui-native/button";
import { InputGroup } from "heroui-native/input-group";
import { useToast } from "heroui-native/toast";
import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "react-native";
import { email, object } from "zod";
import { useRouter } from "expo-router";

const validationSchema = object({
  email: email("Invalid email address").nonempty("Field is required"),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();

  const Form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: validationSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPasswordAPI(value.email);
        toast.show({
          label: "Email Sent",
          variant: "success",
          description: "Check your email for password reset instructions",
        });
        router.back();
      } catch (error: any) {
        // fastapi-users returns 202 even if email doesn't exist (by design)
        toast.show({
          label: "Email Sent",
          variant: "success",
          description: "If an account exists, you'll receive reset instructions",
        });
        router.back();
      }
    },
  });

  return (
    <ScrollView contentContainerClassName="grow p-4 gap-y-3">
      <Text className="text-default-foreground text-base mb-2">
        Enter your email address and we'll send you instructions to reset your
        password.
      </Text>

      <Form.AppField name="email">
        {() => (
          <FormInput
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address">
            <InputGroup.Prefix isDecorative>
              <SIonicons
                size={20}
                name="mail-outline"
                className="text-default-foreground"
              />
            </InputGroup.Prefix>
          </FormInput>
        )}
      </Form.AppField>

      <View className="h-2" />

      <Form.AppForm>
        <FormButton>
          <Button.Label>Send Reset Link</Button.Label>
        </FormButton>
      </Form.AppForm>

      <Button variant="ghost" className="self-center" onPress={() => router.back()}>
        <Button.Label>Back to Sign In</Button.Label>
      </Button>
    </ScrollView>
  );
}
