import { View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'risk' | 'accent' | 'primary';
  className?: string;
}

const toneMap = {
  default: 'text-foreground',
  risk: 'text-destructive',
  accent: 'text-accent',
  primary: 'text-primary',
} as const;

export function MetricTile({ label, value, sub, tone = 'default', className }: MetricTileProps) {
  return (
    <View className={cn('flex-1 rounded-xl border border-border bg-secondary/40 p-3.5', className)}>
      <Text size="xs" variant="muted" weight="medium" className="uppercase tracking-wide">
        {label}
      </Text>
      <Text size="2xl" weight="bold" className={cn('mt-1', toneMap[tone])}>
        {value}
      </Text>
      {sub ? (
        <Text size="xs" variant="muted" className="mt-0.5">
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
