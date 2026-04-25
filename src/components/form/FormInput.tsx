import type { AnyFieldApi } from "@tanstack/react-form";
import { Description } from "heroui-native/description";
import { FieldError } from "heroui-native/field-error";
import { InputGroup, InputGroupInputProps } from "heroui-native/input-group";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { cn } from "heroui-native/utils";
import { PropsWithChildren } from "react";
import { FadeInUp } from "react-native-reanimated";

function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return String(error);
}

export type FormInputProps = PropsWithChildren<
  InputGroupInputProps & {
    field: AnyFieldApi;
    label?: string;
    description?: string;
  }
>;

export default function FormInput({
  field,
  label,
  description,
  className,
  children,
  ...inputProps
}: Readonly<FormInputProps>) {
  return (
    <TextField isInvalid={!field.state.meta.isValid}>
      {label && (
        <Label>
          <Label.Text>{label}</Label.Text>
        </Label>
      )}
      <InputGroup className="relative">
        <InputGroup.Input
          placeholder={label}
          value={String(field.state.value ?? "")}
          onBlur={field.handleBlur}
          onChangeText={(v) => field.handleChange(v as never)}
          {...inputProps}
          className={cn("", className)}
        />
        {children}
      </InputGroup>
      {field.state.meta.errors.map((error, index) => (
        <FieldError
          key={`${errorText(error)}-${index}`}
          animation={
            index === 0
              ? undefined
              : {
                  entering: {
                    value: FadeInUp.delay((index - 1) * 100),
                  },
                }
          }>
          {errorText(error)}
        </FieldError>
      ))}
      {description && <Description>{description}</Description>}
    </TextField>
  );
}
