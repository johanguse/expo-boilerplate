import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

function Dot({ delay }: { delay: number }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: -4,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(600 - delay),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [translateY, delay]);

  return (
    <Animated.View
      style={{ transform: [{ translateY }] }}
      className="size-2 bg-primary/60 rounded-full"
    />
  );
}

export default function StreamingIndicator() {
  return (
    <View className="px-4 py-2 items-start flex-row gap-x-2">
      <View className="size-7 rounded-full bg-primary/10 items-center justify-center">
        <View className="size-3 bg-primary/40 rounded-full" />
      </View>
      <View className="bg-default-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <View className="flex-row gap-x-1.5 items-center h-4">
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </View>
      </View>
    </View>
  );
}
