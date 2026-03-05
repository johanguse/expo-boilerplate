import { SIonicons } from "@components/common/Icons";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import useAppForm from "@hooks/form.hook";
import useAuthManage from "@services/zustand/auth.zustand";
import { Button } from "heroui-native/button";
import { InputGroup } from "heroui-native/input-group";
import { useToast } from "heroui-native/toast";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { email, object, string } from "zod";
import { useRouter } from "expo-router";

const validationSchema = object({
  name: string().nonempty("Name is required"),
  email: email("Invalid email address").nonempty("Field is required"),
  password: string()
    .nonempty("Field is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: string().nonempty("Please confirm your password"),
}).check((ctx) => {
  if (ctx.value.password !== ctx.value.confirmPassword) {
    ctx.issues.push({
      code: "custom",
      input: ctx.value.confirmPassword,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

export default function SignUpPage() {
  const signUp = useAuthManage((state) => state.signUp);
  const { toast } = useToast();
  const router = useRouter();

  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  const Form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: validationSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await signUp(value.email, value.password, value.name);
        toast.show({
          label: "Welcome!",
          variant: "success",
          description: "Account created successfully",
        });
      } catch (error: any) {
        toast.show({
          label: "Sign Up Failed",
          variant: "danger",
          description: error?.detail ?? error?.message ?? "Something went wrong",
        });
      }
    },
  });

  return (
    <ScrollView contentContainerClassName="grow p-4 gap-y-2">
      <Form.AppField name="name">
        {() => (
          <FormInput label="Name" autoCapitalize="words">
            <InputGroup.Prefix isDecorative>
              <SIonicons
                size={20}
                name="person-outline"
                className="text-default-foreground"
              />
            </InputGroup.Prefix>
          </FormInput>
        )}
      </Form.AppField>

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

      <Form.AppField name="password">
        {() => (
          <FormInput
            label="Password"
            autoCapitalize="none"
            secureTextEntry={!showPass}>
            <InputGroup.Prefix isDecorative>
              <SIonicons
                size={20}
                name="lock-closed-outline"
                className="text-default-foreground"
              />
            </InputGroup.Prefix>
            <InputGroup.Suffix>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={() => setShowPass(!showPass)}>
                <SIonicons
                  size={20}
                  name={showPass ? "eye" : "eye-off"}
                  className="text-default-foreground"
                />
              </Button>
            </InputGroup.Suffix>
          </FormInput>
        )}
      </Form.AppField>

      <Form.AppField name="confirmPassword">
        {() => (
          <FormInput
            label="Confirm Password"
            autoCapitalize="none"
            secureTextEntry={!showConfirmPass}>
            <InputGroup.Prefix isDecorative>
              <SIonicons
                size={20}
                name="lock-closed-outline"
                className="text-default-foreground"
              />
            </InputGroup.Prefix>
            <InputGroup.Suffix>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={() => setShowConfirmPass(!showConfirmPass)}>
                <SIonicons
                  size={20}
                  name={showConfirmPass ? "eye" : "eye-off"}
                  className="text-default-foreground"
                />
              </Button>
            </InputGroup.Suffix>
          </FormInput>
        )}
      </Form.AppField>

      <View className="h-2" />

      <Form.AppForm>
        <FormButton>
          <Button.Label>Create Account</Button.Label>
        </FormButton>
      </Form.AppForm>

      <Button variant="ghost" className="self-center" onPress={() => router.back()}>
        <Button.Label>Already have an account? Sign In</Button.Label>
      </Button>
    </ScrollView>
  );
}
