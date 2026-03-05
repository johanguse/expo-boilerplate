import { SIonicons } from "@components/common/Icons";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import useAppForm from "@hooks/form.hook";
import useAuthManage from "@services/zustand/auth.zustand";
import { Button } from "heroui-native/button";
import { InputGroup } from "heroui-native/input-group";
import { useToast } from "heroui-native/toast";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { email, object, string } from "zod";
import { useRouter } from "expo-router";

const validationSchema = object({
  email: email("Invalid email address").nonempty("Field is required"),
  password: string().nonempty("Field is required"),
});

export default function SignInPage() {
  const signIn = useAuthManage((state) => state.signIn);
  const { toast } = useToast();
  const router = useRouter();

  const [showPass, setShowPass] = useState<boolean>(false);

  const Form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: validationSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await signIn(value.email, value.password);
        toast.show({
          label: "Success",
          variant: "success",
          description: "Login successful",
        });
      } catch (error: any) {
        toast.show({
          label: "Login Failed",
          variant: "danger",
          description:
            error?.detail ?? error?.message ?? "Invalid email or password",
        });
      }
    },
  });

  return (
    <ScrollView contentContainerClassName="grow p-4 gap-y-2">
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

      <Button
        variant="ghost"
        className="self-end -mx-3"
        onPress={() => router.push("/(auth)/forgot-password")}>
        <Button.Label>Forgot Password?</Button.Label>
      </Button>

      <Form.AppForm>
        <FormButton>
          <Button.Label>Sign In</Button.Label>
        </FormButton>
      </Form.AppForm>

      <Button
        variant="ghost"
        className="self-center"
        onPress={() => router.push("/(auth)/signup")}>
        <Button.Label>Don't have an account? Sign Up</Button.Label>
      </Button>
    </ScrollView>
  );
}
