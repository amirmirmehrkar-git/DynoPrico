import { View } from 'react-native';
import {
  Building2,
  Monitor,
  Smartphone,
  Store,
  Tv,
  Bike,
  type LucideIcon,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { CHANNELS, type ChannelKey } from '@/lib/store';

type ChannelMeta = (typeof CHANNELS)[ChannelKey];

const channelIconMap: Record<ChannelMeta['icon'], LucideIcon> = {
  store: Store,
  delivery: Bike,
  mobile: Smartphone,
  menu: Monitor,
  partner: Building2,
  display: Tv,
};

export function ChannelIcon({
  channel,
  size = 14,
  color = 'hsl(24 30% 12%)',
}: {
  channel: ChannelKey;
  size?: number;
  color?: string;
}) {
  const Icon = channelIconMap[CHANNELS[channel].icon];
  return <Icon color={color} size={size} />;
}

export function ChannelChip({ channel, className }: { channel: ChannelKey; className?: string }) {
  const meta = CHANNELS[channel];
  return (
    <View
      className={cn(
        'flex-row items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1',
        className,
      )}
    >
      <ChannelIcon channel={channel} size={13} color="hsl(24 10% 42%)" />
      <Text size="xs" weight="medium" variant="muted">
        {meta.label}
      </Text>
    </View>
  );
}
