import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Package,
  TrendingDown,
  X,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricTile } from '@/components/MetricTile';
import { NotificationBanner } from '@/components/NotificationBanner';
import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function HomeScreen() {
  const router = useRouter();
  const { storeName, storeLocation, recommendations, approve, reject } = useStore();
  const rec = recommendations[0];
  const latestAlert = useStore((s) => s.notifications[0]);

  const handleApprove = () => {
    approve(rec.id);
    router.push(`/result/${rec.id}`);
  };

  const handleReject = () => {
    reject(rec.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerClassName="px-5 pb-10 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text size="sm" variant="muted" weight="medium">
              {storeName}
            </Text>
            <Text size="3xl" weight="bold" className="mt-0.5">
              Today&apos;s AI{'\n'}Recommendations
            </Text>
            <Text size="xs" variant="muted" className="mt-1">
              {storeLocation}
            </Text>
          </View>
        </View>

        {/* Alert banner */}
        {latestAlert ? (
          <View className="mt-5">
            <NotificationBanner title={latestAlert.title} body={latestAlert.body} />
          </View>
        ) : null}

        {/* High priority recommendation card */}
        <Animated.View
          entering={FadeInDown.delay(80).duration(400).springify().damping(16)}
          className="mt-5 overflow-hidden rounded-3xl border border-border bg-card"
        >
          {/* Priority strip */}
          <View className="flex-row items-center gap-2 bg-destructive/10 px-5 py-3">
            <AlertTriangle color="hsl(0 78% 52%)" size={16} />
            <Text size="xs" weight="bold" className="uppercase tracking-wide text-destructive">
              High Priority
            </Text>
            <View className="flex-1" />
            <Badge variant="destructive">
              <Text size="xs" weight="semibold" className="text-destructive-foreground">
                {rec.wasteRisk}% Waste Risk
              </Text>
            </Badge>
          </View>

          <View className="p-5">
            {/* Product */}
            <Text size="xs" variant="muted" weight="medium" className="uppercase tracking-wide">
              Product
            </Text>
            <Text size="2xl" weight="bold" className="mt-1">
              {rec.product}
            </Text>

            {/* Price change */}
            <View className="mt-4 flex-row items-center gap-3 rounded-2xl bg-secondary/50 p-4">
              <View>
                <Text size="xs" variant="muted" weight="medium">
                  Current
                </Text>
                <Text size="xl" weight="semibold" className="text-muted-foreground line-through">
                  €{rec.currentPrice.toFixed(2)}
                </Text>
              </View>
              <ArrowRight color="hsl(24 10% 42%)" size={20} />
              <View>
                <Text size="xs" variant="muted" weight="medium">
                  Recommended
                </Text>
                <Text size="xl" weight="bold" className="text-primary">
                  €{rec.recommendedPrice.toFixed(2)}
                </Text>
              </View>
              <View className="flex-1" />
              <View className="items-end">
                <Package color="hsl(24 10% 42%)" size={18} />
                <Text size="xs" variant="muted" className="mt-1">
                  {rec.inventoryRemaining} left
                </Text>
              </View>
            </View>

            {/* Action */}
            <View className="mt-4 flex-row items-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 p-4">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-accent">
                <TrendingDown color="hsl(0 0% 100%)" size={18} />
              </View>
              <View className="flex-1">
                <Text size="xs" variant="muted" weight="medium" className="uppercase tracking-wide">
                  Recommended Action
                </Text>
                <Text size="base" weight="semibold" className="mt-0.5 text-accent">
                  {rec.action}
                </Text>
              </View>
            </View>

            {/* Metrics */}
            <View className="mt-4 flex-row gap-3">
              <MetricTile
                label="Campaign"
                value={rec.campaignStart}
                sub={`until ${rec.campaignEnd}`}
              />
              <MetricTile
                label="Waste ↓"
                value={`${rec.expectedWasteReduction}%`}
                tone="accent"
                sub="expected"
              />
              <MetricTile
                label="Revenue"
                value={`€${rec.expectedRevenueRecovery}`}
                tone="primary"
                sub="recovery"
              />
            </View>

            {/* Why link */}
            <AnimatedPressable
              hapticFeedback="light"
              onPress={() => router.push(`/recommendation/${rec.id}`)}
              className="mt-4 flex-row items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-3"
            >
              <Clock color="hsl(24 80% 48%)" size={16} />
              <Text size="sm" weight="medium" className="flex-1">
                Why AI suggested this · {rec.confidence}% confidence
              </Text>
              <ChevronRight color="hsl(24 10% 42%)" size={18} />
            </AnimatedPressable>
          </View>
        </Animated.View>

        {/* Decision area */}
        {rec.status === 'pending' ? (
          <Animated.View
            entering={FadeInDown.delay(160).duration(400)}
            className="mt-5 gap-3"
          >
            <Button size="lg" className="h-14" onPress={handleApprove}>
              <View className="flex-row items-center gap-2">
                <Check color="hsl(30 33% 98%)" size={20} />
                <Text size="base" weight="bold" className="text-primary-foreground">
                  Approve Recommendation
                </Text>
              </View>
            </Button>
            <Button size="lg" variant="outline" className="h-14" onPress={handleReject}>
              <View className="flex-row items-center gap-2">
                <X color="hsl(24 30% 12%)" size={20} />
                <Text size="base" weight="semibold">
                  Reject Recommendation
                </Text>
              </View>
            </Button>
          </Animated.View>
        ) : (
          <View
            className={cn(
              'mt-5 flex-row items-center gap-3 rounded-2xl border p-4',
              rec.status === 'approved'
                ? 'border-accent/40 bg-accent/10'
                : 'border-border bg-secondary/40',
            )}
          >
            {rec.status === 'approved' ? (
              <Check color="hsl(160 60% 40%)" size={22} />
            ) : (
              <X color="hsl(24 10% 42%)" size={22} />
            )}
            <View className="flex-1">
              <Text weight="semibold">
                {rec.status === 'approved' ? 'Recommendation Approved' : 'Recommendation Rejected'}
              </Text>
              <Text size="sm" variant="muted">
                {rec.status === 'approved'
                  ? 'Campaign scheduled and published.'
                  : 'No campaign was created.'}
              </Text>
            </View>
            {rec.status === 'approved' ? (
              <AnimatedPressable
                hapticFeedback="light"
                onPress={() => router.push(`/result/${rec.id}`)}
              >
                <ChevronRight color="hsl(160 60% 40%)" size={20} />
              </AnimatedPressable>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
