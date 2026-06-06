import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SegmentedProps<T extends string> {
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <View className="mb-4">
      {label ? (
        <Text size="sm" weight="medium" className="mb-2">
          {label}
        </Text>
      ) : null}
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={cn(
                'min-h-[40px] px-3 py-2 rounded-lg border justify-center',
                active ? 'bg-primary border-primary' : 'bg-card border-border',
              )}
            >
              <Text
                size="sm"
                weight={active ? 'semibold' : 'regular'}
                className={active ? 'text-primary-foreground' : 'text-foreground'}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
