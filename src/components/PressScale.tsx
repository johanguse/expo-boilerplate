import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export function PressScale({ children, onPress, style, scaleTo = 0.97 }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(scaleTo, { duration: 130, easing: Easing.out(Easing.cubic) });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
      }}
      onPress={onPress}
      style={[animStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
