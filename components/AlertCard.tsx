import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Boxes,
  ChevronRight,
  CloudRain,
  Network,
  Trash2,
  Trophy,
  Bike,
  type LucideIcon,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { cn } from '@/lib/utils';
import type { AlertItem, AlertSeverity } from '@/lib/store';

const typeIcon: Record<AlertItem['type'], LucideIcon> = {
  'food-waste': Trash2,
  weather: CloudRain,
  'delivery-demand': Bike,
  'local-event': Trophy,
  inventory: Boxes,
  channel: Network,
};

const severityStyle: Record<
  AlertSeverity,
  { label: string; badge: string; text: string; dot: string }
> = {
  high: {
    label: 'High',
    badge: 'bg-destructive/15',
    text: 'text-destructive',
    dot: 'bg-destructive',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-primary/15',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  low: {
    label: 'Low',
    badge: 'bg-muted',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
};

interface AlertCardProps {
  alert: AlertItem;
  index: number;
  onPressRelated?: () => void;
}

export function AlertCard({ alert, index, onPressRelated }: AlertCardProps) {
  const Icon = typeIcon[alert.type];
  const sev = severityStyle[alert.severity];

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(350)}
      className={cn(
        'rounded-2xl border p-4',
        alert.read ? 'border-border bg-card' : 'border-primary/30 bg-primary/5',
      )}
    >
      <View className="flex-row items-start gap-3">
        <View
          className={cn(
            'h-10 w-10 items-center justify-center rounded-full',
            alert.severity === 'high'
              ? 'bg-destructive/15'
              : alert.severity === 'medium'
                ? 'bg-primary/15'
                : 'bg-secondary',
          )}
        >
          <Icon
            color={
              alert.severity === 'high'
                ? 'hsl(0 78% 52%)'
                : alert.severity === 'medium'
                  ? 'hsl(24 80% 48%)'
                  : 'hsl(24 10% 42%)'
            }
            size={20}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text weight="semibold" className="flex-1">
              {alert.title}
            </Text>
            <View className={cn('flex-row items-center gap-1 rounded-full px-2 py-0.5', sev.badge)}>
              <View className={cn('h-1.5 w-1.5 rounded-full', sev.dot)} />
              <Text size="xs" weight="semibold" className={sev.text}>
                {sev.label}
              </Text>
            </View>
          </View>
          <Text size="sm" variant="muted" className="mt-1">
            {alert.body}
          </Text>
          <Text size="xs" variant="muted" className="mt-1.5">
            {alert.time}
          </Text>

          {alert.recommendationId && onPressRelated ? (
            <AnimatedPressable
              hapticFeedback="light"
              onPress={onPressRelated}
              className="mt-3 min-h-[44px] flex-row items-center gap-1.5 self-start rounded-xl border border-primary/30 bg-primary/10 px-3 py-2"
            >
              <Text size="sm" weight="semibold" className="text-primary">
                View Recommendation
              </Text>
              <ChevronRight color="hsl(24 80% 48%)" size={16} />
            </AnimatedPressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
