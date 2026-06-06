import React from 'react';
import { View } from 'react-native';
import {
  Check,
  ShieldCheck,
  Hash,
  CloudRain,
  Briefcase,
} from 'lucide-react-native';

import { Card, CardContent, Separator, Text } from '@/components/ui';
import { cn } from '@/lib/utils';
import { CHANNEL_LABELS, buildIntegrationTargets } from '@/lib/engine/engine';
import type { Recommendation } from '@/lib/engine/types';

function FactorBar({
  label,
  raw,
  weight,
  weighted,
  detail,
}: {
  label: string;
  raw: number;
  weight: number;
  weighted: number;
  detail: string;
}) {
  const negative = weighted < 0;
  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text size="sm" weight="medium">
          {label}
        </Text>
        <Text size="xs" variant="muted">
          {raw} × {weight.toFixed(2)} ={' '}
          <Text
            size="xs"
            weight="semibold"
            className={negative ? 'text-accent' : 'text-primary'}
          >
            {weighted > 0 ? '+' : ''}
            {weighted}
          </Text>
        </Text>
      </View>
      <View className="h-1.5 rounded-full bg-muted overflow-hidden">
        <View
          className={cn('h-1.5 rounded-full', negative ? 'bg-accent' : 'bg-primary')}
          style={{ width: `${Math.min(100, Math.abs(raw))}%` }}
        />
      </View>
      <Text size="xs" variant="muted" className="mt-1">
        {detail}
      </Text>
    </View>
  );
}

const STATUS_CLASS: Record<string, string> = {
  Published: 'bg-accent/15 text-accent',
  Scheduled: 'bg-primary/15 text-primary',
  Ready: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'Placeholder integration': 'bg-muted text-muted-foreground',
};

export function RecommendationDetail({ rec }: { rec: Recommendation }) {
  const targets = buildIntegrationTargets(rec);
  const delivery = targets.filter((t) => t.group === 'delivery');
  const forward = targets.filter((t) => t.group === 'forward');

  return (
    <View>
      {/* Final price calc */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <Text size="sm" weight="semibold" className="mb-3">
            Final Price Calculation
          </Text>
          <View className="flex-row justify-between mb-1.5">
            <Text size="sm" variant="muted">
              Current price
            </Text>
            <Text size="sm">€{rec.currentPrice.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-1.5">
            <Text size="sm" variant="muted">
              Discount applied
            </Text>
            <Text size="sm">−{rec.discountPercent}%</Text>
          </View>
          <View className="flex-row justify-between mb-1.5">
            <Text size="sm" variant="muted">
              Recommended price
            </Text>
            <Text size="sm" weight="bold" className="text-primary">
              €{rec.recommendedPrice.toFixed(2)}
            </Text>
          </View>
          <Separator className="my-2" />
          <View className="flex-row items-center gap-2">
            <ShieldCheck
              size={16}
              className={rec.marginCheck.passed ? 'text-accent' : 'text-destructive'}
            />
            <Text size="xs" variant="muted" className="flex-1">
              Margin floor €{rec.marginCheck.floor.toFixed(2)} —{' '}
              {rec.marginCheck.passed ? 'passed' : 'clamped'}. {rec.marginCheck.note}
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Score breakdown */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text size="sm" weight="semibold">
              Score Breakdown
            </Text>
            <Text size="sm" weight="bold" className="text-primary">
              {rec.riskScore}/100 · {rec.riskLevel}
            </Text>
          </View>
          {rec.factors.map((f) => (
            <FactorBar
              key={f.key}
              label={f.label}
              raw={f.rawScore}
              weight={f.weight}
              weighted={f.weighted}
              detail={f.detail}
            />
          ))}
        </CardContent>
      </Card>

      {/* Channel strategy */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <Text size="sm" weight="semibold" className="mb-3">
            Channel Strategy
          </Text>
          {rec.recommendedActions.map((a, i) => (
            <View key={`${a.channel}-${i}`} className="mb-3">
              <View className="flex-row items-center justify-between">
                <Text size="sm" weight="medium">
                  {CHANNEL_LABELS[a.channel]}
                </Text>
                <Text size="sm" weight="semibold" className="text-primary">
                  €{a.price.toFixed(2)}
                </Text>
              </View>
              <Text size="xs" weight="medium" className="text-foreground/80">
                {a.title}
              </Text>
              <Text size="xs" variant="muted">
                {a.reason}
              </Text>
              {i < rec.recommendedActions.length - 1 ? (
                <Separator className="mt-3" />
              ) : null}
            </View>
          ))}
        </CardContent>
      </Card>

      {/* Reasoning */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <Text size="sm" weight="semibold" className="mb-3">
            Explainable Reasoning
          </Text>

          <View className="flex-row items-center gap-2 mb-2">
            <Hash size={14} className="text-primary" />
            <Text size="xs" weight="semibold" className="text-primary">
              Numerical
            </Text>
          </View>
          {rec.reasoning.numerical.map((r, i) => (
            <Text key={`n${i}`} size="sm" variant="muted" className="mb-1">
              • {r}
            </Text>
          ))}

          <View className="flex-row items-center gap-2 mb-2 mt-3">
            <CloudRain size={14} className="text-primary" />
            <Text size="xs" weight="semibold" className="text-primary">
              Contextual
            </Text>
          </View>
          {rec.reasoning.contextual.map((r, i) => (
            <Text key={`c${i}`} size="sm" variant="muted" className="mb-1">
              • {r}
            </Text>
          ))}

          <View className="flex-row items-center gap-2 mb-2 mt-3">
            <Briefcase size={14} className="text-primary" />
            <Text size="xs" weight="semibold" className="text-primary">
              Business
            </Text>
          </View>
          {rec.reasoning.business.map((r, i) => (
            <Text key={`b${i}`} size="sm" variant="muted" className="mb-1">
              • {r}
            </Text>
          ))}

          <Separator className="my-3" />
          <View className="flex-row items-center gap-2">
            <Check size={14} className="text-accent" />
            <Text size="xs" variant="muted">
              AI Confidence: {rec.confidence}%
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* API simulation */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <Text size="sm" weight="semibold" className="mb-1">
            API Simulation
          </Text>
          <Text size="xs" variant="muted" className="mb-3">
            Simulated integration targets — no live calls.
          </Text>

          <Text size="xs" weight="semibold" variant="muted" className="mb-2 uppercase">
            Delivery
          </Text>
          {delivery.map((t) => (
            <StatusRow key={t.name} name={t.name} status={t.status} />
          ))}

          <Text
            size="xs"
            weight="semibold"
            variant="muted"
            className="mb-2 mt-3 uppercase"
          >
            Forward / Local Systems
          </Text>
          {forward.map((t) => (
            <StatusRow key={t.name} name={t.name} status={t.status} />
          ))}
        </CardContent>
      </Card>
    </View>
  );
}

function StatusRow({ name, status }: { name: string; status: string }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text size="sm">{name}</Text>
      <View className={cn('px-2 py-0.5 rounded-full', STATUS_CLASS[status]?.split(' ')[0])}>
        <Text size="xs" weight="semibold" className={STATUS_CLASS[status]?.split(' ')[1]}>
          {status}
        </Text>
      </View>
    </View>
  );
}
