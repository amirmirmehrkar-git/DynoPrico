import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ChannelIcon } from '@/components/ChannelChip';
import { CHANNELS, type ChannelStrategy } from '@/lib/store';

export function ChannelStrategyList({ strategy }: { strategy: ChannelStrategy[] }) {
  return (
    <View className="gap-3">
      {strategy.map((s) => {
        const meta = CHANNELS[s.channel];
        return (
          <View key={s.channel} className="rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <ChannelIcon channel={s.channel} size={16} color="hsl(24 80% 48%)" />
              </View>
              <Text weight="semibold">{meta.label}</Text>
            </View>
            <Text size="sm" variant="muted" className="mt-2">
              {s.insight}
            </Text>
            <View className="mt-2 flex-row gap-1.5">
              <Text size="sm" weight="medium" className="text-accent">
                →
              </Text>
              <Text size="sm" weight="medium" className="flex-1 text-foreground">
                {s.action}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
