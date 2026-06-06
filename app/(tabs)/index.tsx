import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock,
  Package,
  X,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationBanner } from '@/components/NotificationBanner';
import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { PriceEditor } from '@/components/PriceEditor';
import { ActionCard } from '@/components/ActionCard';
import { ChannelStrategyList } from '@/components/ChannelStrategyList';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function HomeScreen() {
  const router = useRouter();
  const storeName = useStore((s) => s.storeName);
  const storeLocation = useStore((s) => s.storeLocation);
  const weather = useStore((s) => s.weather);
  const currentTime = useStore((s) => s.currentTime);
  const recommendations = useStore((s) => s.recommendations);
  const approve = useStore((s) => s.approve);
  const reject = useStore((s) => s.reject);
  const setManagerPrice = useStore((s) => s.setManagerPrice);
  const setActionStatus = useStore((s) => s.setActionStatus);
  const latestAlert = useStore((s) => s.alerts[0]);

  const rec = recommendations[0];
  const acceptedCount = rec.actions.filter((a) => a.status === 'accepted').length;

  const handleApprove = () => {
    approve(rec.id);
    router.push(`/result/${rec.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-2" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View>
          <Text size="sm" variant="muted" weight="medium">
            {storeName}
          </Text>
          <Text size="3xl" weight="bold" className="mt-0.5">
            Today&apos;s AI{'\n'}Recommendations
          </Text>
          <View className="mt-1.5 flex-row items-center gap-2">
            <Text size="xs" variant="muted">
              {storeLocation}
            </Text>
            <View className="h-1 w-1 rounded-full bg-muted-foreground" />
            <Text size="xs" variant="muted">
              {currentTime}
            </Text>
            <View className="h-1 w-1 rounded-full bg-muted-foreground" />
            <Text size="xs" variant="muted">
              {weather}
            </Text>
          </View>
        </View>

        {/* Alert banner */}
        {latestAlert ? (
          <View className="mt-5">
            <NotificationBanner title={latestAlert.title} body={latestAlert.body} />
          </View>
        ) : null}

        {/* Recommendation card */}
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
            {/* Product + meta */}
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text size="xs" variant="muted" weight="medium" className="uppercase tracking-wide">
                  Product
                </Text>
                <Text size="2xl" weight="bold" className="mt-1">
                  {rec.product}
                </Text>
              </View>
              <View className="items-end">
                <View className="flex-row items-center gap-1.5">
                  <Package color="hsl(24 10% 42%)" size={16} />
                  <Text size="sm" weight="semibold">
                    {rec.inventoryRemaining} left
                  </Text>
                </View>
                <View className="mt-1 flex-row items-center gap-1.5">
                  <Clock color="hsl(24 10% 42%)" size={14} />
                  <Text size="xs" variant="muted">
                    {rec.campaignStart}–{rec.campaignEnd}
                  </Text>
                </View>
              </View>
            </View>

            {/* Editable price */}
            <PriceEditor
              currentPrice={rec.currentPrice}
              recommendedPrice={rec.recommendedPrice}
              managerPrice={rec.managerPrice}
              onSave={(p) => setManagerPrice(rec.id, p)}
            />

            {/* Confidence link */}
            <AnimatedPressable
              hapticFeedback="light"
              onPress={() => router.push(`/recommendation/${rec.id}`)}
              className="mt-4 min-h-[44px] flex-row items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-3"
            >
              <View className="h-2 w-2 rounded-full bg-accent" />
              <Text size="sm" weight="medium" className="flex-1">
                Why AI suggested this · {rec.confidence}% confidence
              </Text>
              <ChevronRight color="hsl(24 10% 42%)" size={18} />
            </AnimatedPressable>
          </View>
        </Animated.View>

        {/* Recommended actions */}
        <View className="mt-6 flex-row items-center justify-between">
          <Text size="lg" weight="semibold">
            Recommended Actions
          </Text>
          {rec.status === 'pending' ? (
            <Text size="sm" variant="muted">
              {acceptedCount} accepted
            </Text>
          ) : null}
        </View>
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

        {/* Channel strategy */}
        <Text size="lg" weight="semibold" className="mt-6">
          Channel Strategy
        </Text>
        <Text size="sm" variant="muted" className="mb-3 mt-0.5">
          Rain shifts demand — channels need different actions.
        </Text>
        <ChannelStrategyList strategy={rec.channelStrategy} />

        {/* Decision area */}
        {rec.status === 'pending' ? (
          <Animated.View entering={FadeInDown.delay(160).duration(400)} className="mt-6 gap-3">
            <Button
              size="lg"
              className="h-14"
              disabled={acceptedCount === 0}
              onPress={handleApprove}
            >
              <View className="flex-row items-center gap-2">
                <Check color="hsl(30 33% 98%)" size={20} />
                <Text size="base" weight="bold" className="text-primary-foreground">
                  {acceptedCount > 0
                    ? `Approve ${acceptedCount} Selected ${acceptedCount === 1 ? 'Action' : 'Actions'}`
                    : 'Accept an action to approve'}
                </Text>
              </View>
            </Button>
            <Button size="lg" variant="outline" className="h-14" onPress={() => reject(rec.id)}>
              <View className="flex-row items-center gap-2">
                <X color="hsl(24 30% 12%)" size={20} />
                <Text size="base" weight="semibold">
                  Reject All
                </Text>
              </View>
            </Button>
          </Animated.View>
        ) : (
          <View
            className={cn(
              'mt-6 flex-row items-center gap-3 rounded-2xl border p-4',
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
                {rec.status === 'approved' ? 'Actions Approved' : 'Recommendation Rejected'}
              </Text>
              <Text size="sm" variant="muted">
                {rec.status === 'approved'
                  ? 'Campaign scheduled and publishing.'
                  : 'No campaign was created.'}
              </Text>
            </View>
            {rec.status === 'approved' ? (
              <AnimatedPressable hapticFeedback="light" onPress={() => router.push(`/result/${rec.id}`)}>
                <ChevronRight color="hsl(160 60% 40%)" size={20} />
              </AnimatedPressable>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
