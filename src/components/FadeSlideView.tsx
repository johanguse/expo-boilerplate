import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  fromY?: number;
  style?: StyleProp<ViewStyle>;
};

export function FadeSlideView({ children, delay = 0, duration = 380, fromY = 16, style }: Props) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(fromY);

  useEffect(() => {
    const cfg = { duration, easing: Easing.out(Easing.cubic) };
    opacity.value = withDelay(delay, withTiming(1, cfg));
    ty.value = withDelay(delay, withTiming(0, cfg));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}
