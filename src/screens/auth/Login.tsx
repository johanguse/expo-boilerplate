import { SIonicons } from "@components/common/Icons";
import FormButton from "@components/form/FormButton";
import FormInput from "@components/form/FormInput";
import useAppForm from "@hooks/form.hook";
import useAuthManage from "@services/zustand/auth.zustand";
import { sleep } from "@utils/helper";
import { Button } from "heroui-native/button";
import { InputGroup } from "heroui-native/input-group";
import { useToast } from "heroui-native/toast";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { email, object, string } from "zod";

const validationSchema = object({
  email: email("Invalid email address").nonempty("Field is required"),
  password: string().nonempty("Field is required"),
});

export default function SignInPage() {
  const signIn = useAuthManage((state) => state.signIn);
  const { toast } = useToast();

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
      await sleep(2000);
      toast.show({
        label: "Success",
        variant: "success",
        description: "Login successful",
      });
      signIn();
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

      <Button variant="ghost" className="self-end -mx-3">
        <Button.Label>Forgot Password?</Button.Label>
      </Button>

      <Form.AppForm>
        <FormButton>
          <Button.Label>Sign In</Button.Label>
        </FormButton>
      </Form.AppForm>

      <Button variant="ghost" className="self-center">
        <Button.Label>Don't have an account? Sign Up</Button.Label>
      </Button>
    </ScrollView>
  );
}
