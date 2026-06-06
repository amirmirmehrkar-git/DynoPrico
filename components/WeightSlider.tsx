import React from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { Text } from '@/components/ui';

interface SliderProps {
  value: number; // 0..1
  onChange: (v: number) => void;
  label: string;
  /** Optional formatted display of the value. */
  display?: string;
}

const TRACK_PAD = 2;

export function WeightSlider({ value, onChange, label, display }: SliderProps) {
  const widthRef = React.useRef(1);
  const fill = useSharedValue(value);

  // keep shared value in sync when value changes externally (e.g. reset)
  React.useEffect(() => {
    fill.value = value;
  }, [value, fill]);

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = Math.max(1, e.nativeEvent.layout.width);
  };

  const commit = (ratio: number) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    onChange(Math.round(clamped * 100) / 100);
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      const ratio = (e.x - TRACK_PAD) / (widthRef.current - TRACK_PAD * 2);
      fill.value = Math.max(0, Math.min(1, ratio));
      runOnJS(commit)(ratio);
    })
    .onUpdate((e) => {
      const ratio = (e.x - TRACK_PAD) / (widthRef.current - TRACK_PAD * 2);
      fill.value = Math.max(0, Math.min(1, ratio));
      runOnJS(commit)(ratio);
    });

  const tap = Gesture.Tap().onEnd((e) => {
    const ratio = (e.x - TRACK_PAD) / (widthRef.current - TRACK_PAD * 2);
    fill.value = Math.max(0, Math.min(1, ratio));
    runOnJS(commit)(ratio);
  });

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));
  const knobStyle = useAnimatedStyle(() => ({
    left: `${fill.value * 100}%`,
  }));

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text size="sm" weight="medium">
          {label}
        </Text>
        <Text size="sm" weight="semibold" className="text-primary">
          {display ?? value.toFixed(2)}
        </Text>
      </View>
      <GestureDetector gesture={Gesture.Race(pan, tap)}>
        <View
          onLayout={onLayout}
          className="h-9 justify-center"
          accessibilityRole="adjustable"
          accessibilityLabel={label}
        >
          <View className="h-2 rounded-full bg-muted overflow-hidden">
            <Animated.View
              className="h-2 rounded-full bg-primary"
              style={fillStyle}
            />
          </View>
          <Animated.View
            style={knobStyle}
            className="absolute"
          >
            <View className="-ml-2.5 h-5 w-5 rounded-full bg-primary border-2 border-background shadow" />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}
