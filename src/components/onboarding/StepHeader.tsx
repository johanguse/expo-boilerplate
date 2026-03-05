import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export function StepHeader({ currentStep, totalSteps }: StepHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row gap-x-2 px-6 pb-2"
      style={{ paddingTop: insets.top + 16 }}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`h-1 flex-1 rounded-full ${
            index < currentStep ? "bg-primary" : "bg-default-200"
          }`}
        />
      ))}
    </View>
  );
}
