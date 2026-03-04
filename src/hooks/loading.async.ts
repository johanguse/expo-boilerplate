import { useCallback, useState } from "react";

type ReturnType = [boolean, () => void];

export const useLoadingAsync = (
  action?: () => Promise<void> | undefined,
): ReturnType => {
  const [isPending, setIsPending] = useState(false);

  const handlePress = useCallback(async () => {
    if (!action) return;

    setIsPending(true);
    try {
      await action();
    } catch (error) {
      console.warn("🚀 - useLoadingAsync - error:", error);
    }
    setIsPending(false);
  }, [action]);

  return [isPending, handlePress];
};
