import { createFormHookContexts } from '@tanstack/react-form';
import React, { PropsWithChildren, Suspense } from 'react';
import ActionButton, { ActionButtonProps } from '../common/ActionButton';

const { useFormContext } = createFormHookContexts();

type FormButtonProps = PropsWithChildren<
  Omit<ActionButtonProps, 'children' | 'action'>
> & {
  loadingText?: string;
};

const FormButton: React.FC<FormButtonProps> = props => {
  const form = useFormContext();

  return (
    <ActionButton
      action={form.handleSubmit}
      isSubmitting={form.state.isSubmitting}
      {...props}
    >
      {props.children}
    </ActionButton>
  );
};

export default FormButton;
