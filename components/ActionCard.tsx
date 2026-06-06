import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Check, X } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { ChannelChip } from '@/components/ChannelChip';
import { cn } from '@/lib/utils';
import type { RecommendedAction } from '@/lib/store';

interface ActionCardProps {
  index: number;
  action: RecommendedAction;
  onAccept: () => void;
  onReject: () => void;
}

export function ActionCard({ index, action, onAccept, onReject }: ActionCardProps) {
  const accepted = action.status === 'accepted';
  const rejected = action.status === 'rejected';

  return (
    <View
      className={cn(
        'rounded-2xl border p-4',
        accepted
          ? 'border-accent/50 bg-accent/10'
          : rejected
            ? 'border-border bg-secondary/30'
            : 'border-border bg-card',
      )}
    >
      <View className="flex-row items-start gap-3">
        <View
          className={cn(
            'h-7 w-7 items-center justify-center rounded-full',
            accepted ? 'bg-accent' : 'bg-secondary',
          )}
        >
          <Text size="sm" weight="bold" className={accepted ? 'text-white' : 'text-foreground'}>
            {index + 1}
          </Text>
        </View>
        <View className="flex-1">
          <Text weight="semibold" className={cn(rejected && 'text-muted-foreground line-through')}>
            {action.title}
          </Text>
          <Text size="sm" variant="muted" className="mt-0.5">
            {action.description}
          </Text>
        </View>
        <View className="rounded-lg bg-primary/10 px-2.5 py-1">
          <Text size="sm" weight="bold" className="text-primary">
            {action.priceLabel}
          </Text>
        </View>
      </View>

      {/* Channels */}
      <View className="mt-3 flex-row flex-wrap gap-2">
        {action.channels.map((c) => (
          <ChannelChip key={c} channel={c} />
        ))}
      </View>

      {/* Accept / Reject */}
      {action.status === 'pending' ? (
        <View className="mt-3 flex-row gap-2.5">
          <AnimatedPressable
            hapticFeedback="medium"
            onPress={onAccept}
            className="min-h-[44px] flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-accent"
          >
            <Check color="hsl(0 0% 100%)" size={17} strokeWidth={2.5} />
            <Text size="sm" weight="semibold" className="text-white">
              Accept
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            hapticFeedback="light"
            onPress={onReject}
            className="min-h-[44px] flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/50"
          >
            <X color="hsl(24 10% 42%)" size={17} strokeWidth={2.5} />
            <Text size="sm" weight="semibold" variant="muted">
              Reject
            </Text>
          </AnimatedPressable>
        </View>
      ) : (
        <Animated.View
          entering={FadeIn.duration(250)}
          className="mt-3 flex-row items-center gap-2"
        >
          {accepted ? (
            <>
              <View className="flex-row items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5">
                <Check color="hsl(160 60% 40%)" size={14} strokeWidth={2.5} />
                <Text size="xs" weight="semibold" className="text-accent">
                  Accepted
                </Text>
              </View>
              <Text size="xs" variant="muted" className="text-primary" onPress={onReject}>
                Undo
              </Text>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                <X color="hsl(24 10% 42%)" size={14} strokeWidth={2.5} />
                <Text size="xs" weight="medium" variant="muted">
                  Rejected
                </Text>
              </View>
              <Text size="xs" variant="muted" className="text-primary" onPress={onAccept}>
                Undo
              </Text>
            </>
          )}
        </Animated.View>
      )}
    </View>
  );
}
