import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

type IconSet = {
  active: React.ComponentProps<typeof Ionicons>['name'];
  inactive: React.ComponentProps<typeof Ionicons>['name'];
};

const TAB_ICONS: Record<string, IconSet> = {
  index: { active: 'home', inactive: 'home-outline' },
  chat: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  explore: { active: 'compass', inactive: 'compass-outline' },
  profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TabIcon({
  name,
  color,
  isFocused,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  isFocused: boolean;
}) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (isFocused) {
      scale.value = withTiming(1.18, { duration: 90, easing: Easing.out(Easing.cubic) }, () => {
        scale.value = withTiming(1, { duration: 210, easing: Easing.out(Easing.cubic) });
      });
    }
  }, [isFocused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={name} size={25} color={color} />
    </Animated.View>
  );
}

export function LiquidGlassTabs({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  const visibleRoutes = state.routes.filter(
    (r) => descriptors[r.key].options.href !== null,
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(18,18,18,0.97)' : 'rgba(255,255,255,0.97)',
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          paddingBottom: bottomPad,
          height: 56 + bottomPad,
        },
      ]}
    >
      {visibleRoutes.map((route) => {
        const globalIndex = state.routes.findIndex((r) => r.key === route.key);
        const isFocused = state.index === globalIndex;
        const icons = TAB_ICONS[route.name];
        const iconName = isFocused ? (icons?.active ?? 'ellipse') : (icons?.inactive ?? 'ellipse-outline');
        const color = isFocused ? '#007AFF' : isDark ? '#636366' : '#8E8E93';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <AnimatedPressable key={route.key} onPress={onPress} style={styles.tab}>
            <TabIcon name={iconName} color={color} isFocused={isFocused} />
            {isFocused && <View style={[styles.dot, { backgroundColor: '#007AFF' }]} />}
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
