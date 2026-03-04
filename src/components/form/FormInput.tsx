import { createFormHookContexts } from "@tanstack/react-form";
import { Description } from "heroui-native/description";
import { FieldError } from "heroui-native/field-error";
import { InputGroup, InputGroupInputProps } from "heroui-native/input-group";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { cn } from "heroui-native/utils";
import { PropsWithChildren } from "react";
import { FadeInUp } from "react-native-reanimated";

const { useFieldContext } = createFormHookContexts();

interface FormInputProps extends PropsWithChildren<InputGroupInputProps> {
  label?: string;
  description?: string;
}

export default function FormInput({
  label,
  description,
  className,
  children,
  ...inputProps
}: Readonly<FormInputProps>) {
  const field = useFieldContext<string>();

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
          value={field.state.value}
          onBlur={field.handleBlur}
          onChangeText={field.handleChange}
          {...inputProps}
          className={cn("", className)}
        />
        {children}
      </InputGroup>
      {field.state.meta.errors.map((error, index) => (
        <FieldError
          key={`${error.message}-${index}`}
          animation={
            index === 0
              ? undefined
              : {
                  entering: {
                    value: FadeInUp.delay((index - 1) * 100),
                  },
                }
          }>
          {error.message}
        </FieldError>
      ))}
      {description && <Description>{description}</Description>}
    </TextField>
  );
}
