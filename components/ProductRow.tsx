import React from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/utils';
import { CHANNEL_LABELS } from '@/lib/engine/engine';
import type { Recommendation } from '@/lib/engine/types';

function riskClasses(level: Recommendation['riskLevel']) {
  switch (level) {
    case 'High':
      return 'bg-destructive/15 text-destructive';
    case 'Medium':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
    default:
      return 'bg-accent/15 text-accent';
  }
}

interface Props {
  rec: Recommendation;
  selected: boolean;
  onPress: () => void;
}

export function ProductRow({ rec, selected, onPress }: Props) {
  const best = rec.recommendedActions[0];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        'rounded-xl border p-4 mb-3',
        selected ? 'border-primary bg-primary/5' : 'border-border bg-card',
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text weight="semibold" size="base">
            {rec.productName}
          </Text>
          <Text size="xs" variant="muted">
            {rec.category} · {rec.inventory} in stock · {rec.hoursUntilExpiry}h to expiry
          </Text>
        </View>
        <View className={cn('px-2.5 py-1 rounded-full', riskClasses(rec.riskLevel))}>
          <Text size="xs" weight="bold" className={riskClasses(rec.riskLevel).split(' ')[1]}>
            {rec.riskScore} · {rec.riskLevel}
          </Text>
        </View>
      </View>

      <View className="flex-row items-end justify-between mt-3">
        <View>
          <Text size="xs" variant="muted">
            Price
          </Text>
          <View className="flex-row items-baseline gap-2">
            <Text size="xs" variant="muted" className="line-through">
              €{rec.currentPrice.toFixed(2)}
            </Text>
            <Text size="lg" weight="bold" className="text-primary">
              €{rec.recommendedPrice.toFixed(2)}
            </Text>
            <Text size="xs" weight="semibold" className="text-accent">
              −{rec.discountPercent}%
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="items-end">
            <Text size="xs" variant="muted">
              Best action
            </Text>
            <Text size="xs" weight="medium" numberOfLines={1}>
              {best ? `${best.title} · ${CHANNEL_LABELS[best.channel]}` : '—'}
            </Text>
          </View>
          <ChevronRight size={16} className="text-muted-foreground" />
        </View>
      </View>
    </Pressable>
  );
}
