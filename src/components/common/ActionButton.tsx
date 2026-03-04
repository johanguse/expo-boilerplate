import { useLoadingAsync } from "@hooks/loading.async";
import { Button, ButtonRootProps } from "heroui-native/button";
import { Spinner } from "heroui-native/spinner";
import { PropsWithChildren } from "react";
import { FadeIn } from "react-native-reanimated";

export type ActionButtonProps = PropsWithChildren<ButtonRootProps> & {
  isLoading?: boolean;
  isSubmitting?: boolean;
  action?: () => Promise<void>;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  children,
  isLoading,
  isSubmitting,
  ...props
}) => {
  const [isPending, handlePress] = useLoadingAsync(action);

  return (
    <Button
      onPress={handlePress}
      isDisabled={isPending || isLoading || isSubmitting}
      {...props}>
      {isPending || isLoading || isSubmitting ? (
        <>
          <Spinner entering={FadeIn.delay(50)} size="sm" color="white" />
          {!props.isIconOnly && children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default ActionButton;
