import ActionButton, { ActionButtonProps } from "@components/common/ActionButton";
import React, { PropsWithChildren } from "react";

export type SubmitFormHandle = {
  handleSubmit: () => void | Promise<void>;
  state: { isSubmitting: boolean };
};

type FormButtonProps = PropsWithChildren<
  Omit<
    ActionButtonProps,
    "children" | "action" | "isSubmitting" | "feedbackVariant"
  > & {
    form: SubmitFormHandle;
  }
>;

const FormButton: React.FC<FormButtonProps> = (props) => {
  const { form, children, ...rest } = props;

  return (
    <ActionButton
      {...rest}
      feedbackVariant="none"
      animation="disable-all"
      action={async () => {
        await form.handleSubmit();
      }}
      isSubmitting={form.state.isSubmitting}>
      {children}
    </ActionButton>
  );
};

export default FormButton;
