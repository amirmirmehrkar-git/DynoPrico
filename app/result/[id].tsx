import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { CalendarClock, Check, CircleCheck, Loader, MonitorSmartphone, Network, Smartphone, Store, type LucideIcon } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useStore, type PublishChannel } from '@/lib/store';

const channelIcon: Record<string, LucideIcon> = {
  'digital-menu': MonitorSmartphone,
  'in-store': Store,
  partner: Network,
  'mobile-app': Smartphone,
};

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { recommendations, publishChannels } = useStore();
  const rec = recommendations.find((r) => r.id === id) ?? recommendations[0];

  // Simulate channels going from publishing -> ready for a realistic operational feel
  const [readyCount, setReadyCount] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setReadyCount(i);
      if (i >= publishChannels.length) clearInterval(interval);
    }, 450);
    return () => clearInterval(interval);
  }, [publishChannels.length]);

  const resolvedChannels: PublishChannel[] = publishChannels.map((c, idx) => ({
    ...c,
    status: idx < readyCount ? 'ready' : 'publishing',
  }));

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
              {rec.product} · {rec.action}
            </Text>
          </Animated.View>
        </View>

        {/* Publishing status */}
        <Text size="lg" weight="semibold" className="mt-8">
          Publishing Status
        </Text>
        <View className="mt-3 gap-3">
          {resolvedChannels.map((channel, i) => {
            const Icon = channelIcon[channel.key] ?? Network;
            const isReady = channel.status === 'ready';
            return (
              <Animated.View
                key={channel.key}
                entering={FadeInDown.delay(i * 100).duration(380)}
                className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Icon color="hsl(24 30% 12%)" size={20} />
                </View>
                <Text weight="medium" className="flex-1">
                  {channel.label}
                </Text>
                {isReady ? (
                  <Animated.View
                    entering={ZoomIn.duration(300)}
                    className="flex-row items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5"
                  >
                    <CircleCheck color="hsl(160 60% 40%)" size={15} />
                    <Text size="xs" weight="semibold" className="text-accent">
                      Ready
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
          <View className="mt-4 flex-row gap-4">
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
