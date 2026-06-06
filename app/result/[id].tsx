import { useEffect, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CalendarClock, Check, CircleCheck, Clock3, Loader, Send } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ChannelIcon } from '@/components/ChannelChip';
import { useStore, type PublishStatus } from '@/lib/store';
import { cn } from '@/lib/utils';

const statusMeta: Record<
  Exclude<PublishStatus, 'pending'>,
  { label: string; bg: string; text: string; Icon: typeof CircleCheck; iconColor: string }
> = {
  published: {
    label: 'Published',
    bg: 'bg-accent/15',
    text: 'text-accent',
    Icon: CircleCheck,
    iconColor: 'hsl(160 60% 40%)',
  },
  scheduled: {
    label: 'Scheduled',
    bg: 'bg-primary/15',
    text: 'text-primary',
    Icon: Clock3,
    iconColor: 'hsl(24 80% 48%)',
  },
  ready: {
    label: 'Ready',
    bg: 'bg-secondary',
    text: 'text-muted-foreground',
    Icon: Send,
    iconColor: 'hsl(24 10% 42%)',
  },
};

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const recommendations = useStore((s) => s.recommendations);
  const publishChannels = useStore((s) => s.publishChannels);
  const rec = recommendations.find((r) => r.id === id) ?? recommendations[0];
  const acceptedActions = rec.actions.filter((a) => a.status === 'accepted');

  // Animate each channel from "publishing" to its final state.
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setResolvedCount(i);
      if (i >= publishChannels.length) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [publishChannels.length]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerClassName="flex-grow px-5 pb-8 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Success header */}
        <View className="items-center">
          <Animated.View
            entering={ZoomIn.duration(450).springify().damping(12)}
            className="h-20 w-20 items-center justify-center rounded-full bg-accent"
          >
            <Check color="hsl(0 0% 100%)" size={40} strokeWidth={3} />
          </Animated.View>
          <Animated.View entering={FadeIn.delay(200)} className="mt-4 items-center">
            <Text size="2xl" weight="bold">
              Recommendation Approved
            </Text>
            <Text variant="muted" className="mt-1 text-center">
              {rec.product} · {acceptedActions.length}{' '}
              {acceptedActions.length === 1 ? 'action' : 'actions'} going live
            </Text>
          </Animated.View>
        </View>

        {/* Accepted actions recap */}
        {acceptedActions.length > 0 ? (
          <Animated.View
            entering={FadeIn.delay(280)}
            className="mt-6 rounded-2xl border border-border bg-card p-4"
          >
            <Text size="xs" weight="medium" variant="muted" className="uppercase tracking-wide">
              Approved Actions
            </Text>
            <View className="mt-2 gap-1.5">
              {acceptedActions.map((a) => (
                <View key={a.id} className="flex-row items-center gap-2">
                  <CircleCheck color="hsl(160 60% 40%)" size={15} />
                  <Text size="sm" weight="medium" className="flex-1">
                    {a.title}
                  </Text>
                  <Text size="sm" weight="bold" className="text-primary">
                    {a.priceLabel}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        ) : null}

        {/* Publishing status */}
        <Text size="lg" weight="semibold" className="mt-8">
          Publishing Status
        </Text>
        <View className="mt-3 gap-3">
          {publishChannels.map((channel, i) => {
            const resolved = i < resolvedCount;
            const meta = statusMeta[channel.status as Exclude<PublishStatus, 'pending'>];
            const StatusIcon = meta.Icon;
            return (
              <Animated.View
                key={channel.key}
                entering={FadeInDown.delay(i * 100).duration(380)}
                className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <ChannelIcon channel={channel.key} size={20} color="hsl(24 30% 12%)" />
                </View>
                <Text weight="medium" className="flex-1">
                  {channel.label}
                </Text>
                {resolved ? (
                  <Animated.View
                    entering={ZoomIn.duration(300)}
                    className={cn('flex-row items-center gap-1.5 rounded-full px-3 py-1.5', meta.bg)}
                  >
                    <StatusIcon color={meta.iconColor} size={15} />
                    <Text size="xs" weight="semibold" className={meta.text}>
                      {meta.label}
                    </Text>
                  </Animated.View>
                ) : (
                  <View className="flex-row items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                    <Loader color="hsl(24 10% 42%)" size={15} />
                    <Text size="xs" weight="medium" variant="muted">
                      Publishing
                    </Text>
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Campaign scheduled */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          className="mt-6 overflow-hidden rounded-3xl border border-primary/30 bg-primary/10 p-5"
        >
          <View className="flex-row items-center gap-2">
            <CalendarClock color="hsl(24 80% 48%)" size={18} />
            <Text size="sm" weight="semibold" className="uppercase tracking-wide text-primary">
              Campaign Scheduled
            </Text>
          </View>
          <Text size="3xl" weight="bold" className="mt-2 text-primary">
            {rec.campaignStart} – {rec.campaignEnd}
          </Text>
          <View className="mt-4 flex-row gap-6">
            <View>
              <Text size="xs" variant="muted" weight="medium">
                Expected Waste ↓
              </Text>
              <Text size="lg" weight="bold" className="text-accent">
                {rec.expectedWasteReduction}%
              </Text>
            </View>
            <View>
              <Text size="xs" variant="muted" weight="medium">
                Revenue Recovery
              </Text>
              <Text size="lg" weight="bold" className="text-primary">
                €{rec.expectedRevenueRecovery}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View className="flex-1" />

        <Button
          size="lg"
          className="mt-8 h-14"
          onPress={() => router.dismissAll?.() ?? router.replace('/(tabs)')}
        >
          <Text weight="bold" className="text-primary-foreground">
            Back to Dashboard
          </Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
