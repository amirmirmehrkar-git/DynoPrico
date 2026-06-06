import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Boxes,
  CalendarClock,
  Check,
  CloudRain,
  Sparkles,
  Trophy,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { ActionCard } from '@/components/ActionCard';
import { ChannelStrategyList } from '@/components/ChannelStrategyList';
import { useStore, type AIReason } from '@/lib/store';

const iconMap: Record<AIReason['icon'], LucideIcon> = {
  rain: CloudRain,
  inventory: Boxes,
  clock: CalendarClock,
  event: Trophy,
};

export default function RecommendationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const recommendations = useStore((s) => s.recommendations);
  const approve = useStore((s) => s.approve);
  const reject = useStore((s) => s.reject);
  const setActionStatus = useStore((s) => s.setActionStatus);
  const rec = recommendations.find((r) => r.id === id) ?? recommendations[0];
  const acceptedCount = rec.actions.filter((a) => a.status === 'accepted').length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-3 px-5 py-3">
        <AnimatedPressable
          hapticFeedback="light"
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
        >
          <ArrowLeft color="hsl(24 30% 12%)" size={20} />
        </AnimatedPressable>
        <Text size="lg" weight="semibold">
          Recommendation Details
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-32 pt-2" showsVerticalScrollIndicator={false}>
        <Text size="2xl" weight="bold">
          {rec.product}
        </Text>
        <Text variant="muted" className="mt-1">
          {rec.wasteRisk}% waste risk · {rec.inventoryRemaining} units · {rec.campaignStart}–{rec.campaignEnd}
        </Text>

        {/* Confidence */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="mt-5 overflow-hidden rounded-3xl border border-primary/30 bg-primary/10 p-5"
        >
          <View className="flex-row items-center gap-2">
            <Sparkles color="hsl(24 80% 48%)" size={18} />
            <Text size="sm" weight="semibold" className="uppercase tracking-wide text-primary">
              AI Confidence
            </Text>
          </View>
          <Text size="3xl" weight="bold" className="mt-2 text-primary">
            {rec.confidence}%
          </Text>
          <View className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary/20">
            <View className="h-full rounded-full bg-primary" style={{ width: `${rec.confidence}%` }} />
          </View>
          <Text size="xs" variant="muted" className="mt-2">
            Based on weather, inventory, sales patterns, and local events.
          </Text>
        </Animated.View>

        {/* Why */}
        <Text size="lg" weight="semibold" className="mt-6">
          Why AI Suggested This
        </Text>
        <View className="mt-3 gap-3">
          {rec.reasons.map((reason, i) => {
            const Icon = iconMap[reason.icon];
            return (
              <Animated.View
                key={reason.text}
                entering={FadeInDown.delay(100 + i * 70).duration(380)}
                className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/15">
                  <Icon color="hsl(160 60% 40%)" size={20} />
                </View>
                <Text size="sm" className="flex-1" weight="medium">
                  {reason.text}
                </Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Channel strategy */}
        <Text size="lg" weight="semibold" className="mt-6">
          Channel Strategy
        </Text>
        <Text size="sm" variant="muted" className="mb-3 mt-0.5">
          Different channels need different pricing because of the rain.
        </Text>
        <ChannelStrategyList strategy={rec.channelStrategy} />

        {/* Recommended actions */}
        <Text size="lg" weight="semibold" className="mt-6">
          Recommended Actions
        </Text>
        <View className="mt-3 gap-3">
          {rec.actions.map((action, i) => (
            <ActionCard
              key={action.id}
              index={i}
              action={action}
              onAccept={() => setActionStatus(rec.id, action.id, 'accepted')}
              onReject={() => setActionStatus(rec.id, action.id, 'rejected')}
            />
          ))}
        </View>
      </ScrollView>

      {rec.status === 'pending' ? (
        <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 border-t border-border bg-background px-5 pb-8 pt-3">
          <Button
            variant="outline"
            className="h-14 flex-1"
            onPress={() => {
              reject(rec.id);
              router.back();
            }}
          >
            <View className="flex-row items-center gap-2">
              <X color="hsl(24 30% 12%)" size={18} />
              <Text weight="semibold">Reject All</Text>
            </View>
          </Button>
          <Button
            className="h-14 flex-1"
            disabled={acceptedCount === 0}
            onPress={() => {
              approve(rec.id);
              router.replace(`/result/${rec.id}`);
            }}
          >
            <View className="flex-row items-center gap-2">
              <Check color="hsl(30 33% 98%)" size={18} />
              <Text weight="bold" className="text-primary-foreground">
                Approve{acceptedCount > 0 ? ` (${acceptedCount})` : ''}
              </Text>
            </View>
          </Button>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
