import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RotateCcw } from 'lucide-react-native';

import { Button, Card, CardContent, Separator, Text } from '@/components/ui';
import { Segmented } from '@/components/Segmented';
import { WeightSlider } from '@/components/WeightSlider';
import { ProductRow } from '@/components/ProductRow';
import { RecommendationDetail } from '@/components/RecommendationDetail';
import { useEngineStore } from '@/lib/engine/store';
import { DAYS, EVENT_LABELS } from '@/lib/engine/data';
import type { FactorWeights } from '@/lib/engine/types';

const WEIGHT_LABELS: { key: keyof FactorWeights; label: string }[] = [
  { key: 'inventorySurplus', label: 'Inventory Surplus' },
  { key: 'expiryUrgency', label: 'Expiry Urgency' },
  { key: 'historicalDemand', label: 'Historical Demand' },
  { key: 'weather', label: 'Weather' },
  { key: 'traffic', label: 'Traffic / Footfall' },
  { key: 'event', label: 'Event Impact' },
  { key: 'dayTime', label: 'Day / Time' },
  { key: 'marginProtection', label: 'Margin Protection' },
];

export default function DashboardScreen() {
  const context = useEngineStore((s) => s.context);
  const weights = useEngineStore((s) => s.weights);
  const recommendations = useEngineStore((s) => s.recommendations);
  const selectedId = useEngineStore((s) => s.selectedProductId);

  const setWeather = useEngineStore((s) => s.setWeather);
  const setTraffic = useEngineStore((s) => s.setTraffic);
  const setEvent = useEngineStore((s) => s.setEvent);
  const setDayContext = useEngineStore((s) => s.setDayContext);
  const setMinMargin = useEngineStore((s) => s.setMinMargin);
  const setWeight = useEngineStore((s) => s.setWeight);
  const resetWeights = useEngineStore((s) => s.resetWeights);
  const resetScenario = useEngineStore((s) => s.resetScenario);
  const selectProduct = useEngineStore((s) => s.selectProduct);

  const selected = recommendations.find((r) => r.productId === selectedId) ?? null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-5">
          <Text size="2xl" weight="bold">
            Decision Engine
          </Text>
          <Text size="sm" variant="muted">
            Hamburg Bakery #17 · tune weights & scenarios, see prices recompute live.
          </Text>
        </View>

        {/* 1. Scenario controls */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text size="lg" weight="semibold">
                Scenario Controls
              </Text>
              <Button variant="ghost" size="sm" onPress={resetScenario}>
                <View className="flex-row items-center gap-1">
                  <RotateCcw size={14} className="text-primary" />
                  <Text size="xs" weight="medium" className="text-primary">
                    Reset
                  </Text>
                </View>
              </Button>
            </View>

            <Segmented
              label="Weather"
              value={context.weather.condition}
              onChange={(v) => setWeather({ condition: v })}
              options={[
                { label: 'Sunny', value: 'sunny' },
                { label: 'Cloudy', value: 'cloudy' },
                { label: 'Rain', value: 'rain' },
                { label: 'Storm', value: 'storm' },
              ]}
            />
            <Segmented
              label="Rain Intensity"
              value={context.weather.rainIntensity}
              onChange={(v) => setWeather({ rainIntensity: v })}
              options={[
                { label: 'None', value: 'none' },
                { label: 'Light', value: 'light' },
                { label: 'Medium', value: 'medium' },
                { label: 'Heavy', value: 'heavy' },
              ]}
            />
            <Segmented
              label="Temperature"
              value={String(context.weather.temperature)}
              onChange={(v) => setWeather({ temperature: Number(v) })}
              options={[
                { label: '4°C', value: '4' },
                { label: '14°C', value: '14' },
                { label: '22°C', value: '22' },
                { label: '30°C', value: '30' },
              ]}
            />
            <Segmented
              label="Foot Traffic"
              value={context.traffic.footTraffic}
              onChange={(v) => setTraffic({ footTraffic: v })}
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
              ]}
            />
            <Segmented
              label="Delivery Demand"
              value={context.traffic.deliveryDemand}
              onChange={(v) => setTraffic({ deliveryDemand: v })}
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
              ]}
            />

            <Separator className="my-2" />

            <Segmented
              label="Event Type"
              value={context.event.type}
              onChange={(v) =>
                setEvent({
                  type: v,
                  name: v === 'none' ? '' : EVENT_LABELS[v],
                })
              }
              options={(Object.keys(EVENT_LABELS) as (keyof typeof EVENT_LABELS)[]).map(
                (k) => ({ label: EVENT_LABELS[k], value: k }),
              )}
            />
            <Segmented
              label="Event Start Time"
              value={context.event.startTime}
              onChange={(v) => setEvent({ startTime: v })}
              options={[
                { label: '12:00', value: '12:00' },
                { label: '15:00', value: '15:00' },
                { label: '18:30', value: '18:30' },
                { label: '20:00', value: '20:00' },
              ]}
            />
            <Segmented
              label="Event Distance"
              value={String(context.event.distanceKm)}
              onChange={(v) => setEvent({ distanceKm: Number(v) })}
              options={[
                { label: '0.5 km', value: '0.5' },
                { label: '1.5 km', value: '1.5' },
                { label: '5 km', value: '5' },
                { label: '10 km', value: '10' },
              ]}
            />

            <Separator className="my-2" />

            <Segmented
              label="Day of Week"
              value={context.dayContext.dayOfWeek}
              onChange={(v) => setDayContext({ dayOfWeek: v })}
              options={DAYS.map((d) => ({ label: d.slice(0, 3), value: d }))}
            />
            <Segmented
              label="Time of Day"
              value={context.dayContext.timeOfDay}
              onChange={(v) => setDayContext({ timeOfDay: v })}
              options={[
                { label: 'Morning', value: 'morning' },
                { label: 'Lunch', value: 'lunch' },
                { label: 'Afternoon', value: 'afternoon' },
                { label: 'Evening', value: 'evening' },
              ]}
            />
            <Segmented
              label="Min Margin Threshold (× cost)"
              value={String(context.minMarginThreshold)}
              onChange={(v) => setMinMargin(Number(v))}
              options={[
                { label: '1.05×', value: '1.05' },
                { label: '1.15×', value: '1.15' },
                { label: '1.30×', value: '1.3' },
                { label: '1.50×', value: '1.5' },
              ]}
            />
          </CardContent>
        </Card>

        {/* 2. Factor weights */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text size="lg" weight="semibold">
                Factor Weights
              </Text>
              <Button variant="ghost" size="sm" onPress={resetWeights}>
                <View className="flex-row items-center gap-1">
                  <RotateCcw size={14} className="text-primary" />
                  <Text size="xs" weight="medium" className="text-primary">
                    Reset
                  </Text>
                </View>
              </Button>
            </View>
            {WEIGHT_LABELS.map((w) => (
              <WeightSlider
                key={w.key}
                label={w.label}
                value={weights[w.key]}
                onChange={(v) => setWeight(w.key, v)}
              />
            ))}
          </CardContent>
        </Card>

        {/* 3. Product table */}
        <View className="mb-4">
          <Text size="lg" weight="semibold" className="mb-3">
            Products
          </Text>
          {recommendations.map((rec) => (
            <ProductRow
              key={rec.productId}
              rec={rec}
              selected={rec.productId === selectedId}
              onPress={() => selectProduct(rec.productId)}
            />
          ))}
        </View>

        {/* 4-6. Detail panel */}
        {selected ? (
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text size="lg" weight="semibold">
                {selected.productName}
              </Text>
              <Text size="sm" variant="muted">
                {selected.timeWindow}
              </Text>
            </View>
            <RecommendationDetail rec={selected} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
