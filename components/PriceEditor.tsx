import { useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ArrowRight, Check, Pencil, X } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';

interface PriceEditorProps {
  currentPrice: number;
  recommendedPrice: number;
  managerPrice: number | null;
  onSave: (price: number | null) => void;
}

export function PriceEditor({
  currentPrice,
  recommendedPrice,
  managerPrice,
  onSave,
}: PriceEditorProps) {
  const [editing, setEditing] = useState(false);
  const effectivePrice = managerPrice ?? recommendedPrice;
  const [draft, setDraft] = useState(effectivePrice.toFixed(2));
  const isAdjusted = managerPrice != null;

  const handleSave = () => {
    const parsed = parseFloat(draft.replace(',', '.'));
    if (!Number.isNaN(parsed) && parsed > 0) {
      onSave(parsed);
    }
    setEditing(false);
  };

  return (
    <View className="mt-4 rounded-2xl bg-secondary/50 p-4">
      <View className="flex-row items-center gap-3">
        <View>
          <Text size="xs" variant="muted" weight="medium">
            Current Price
          </Text>
          <Text size="xl" weight="semibold" className="text-muted-foreground line-through">
            €{currentPrice.toFixed(2)}
          </Text>
        </View>
        <ArrowRight color="hsl(24 10% 42%)" size={20} />
        <View className="flex-1">
          <Text size="xs" variant="muted" weight="medium">
            {isAdjusted ? 'Manager Adjusted Price' : 'Recommended Price'}
          </Text>
          {editing ? (
            <Animated.View entering={FadeIn.duration(180)} className="mt-1 flex-row items-center gap-2">
              <View className="flex-row items-center rounded-lg border border-ring bg-background px-2.5">
                <Text size="lg" weight="bold" className="text-foreground">
                  €
                </Text>
                <TextInput
                  autoFocus
                  value={draft}
                  onChangeText={setDraft}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  onSubmitEditing={handleSave}
                  className="min-w-[64px] py-1.5 text-lg font-bold text-foreground"
                  accessibilityLabel="Adjusted price"
                />
              </View>
            </Animated.View>
          ) : (
            <View className="mt-0.5 flex-row items-center gap-2">
              <Text size="xl" weight="bold" className="text-primary">
                €{effectivePrice.toFixed(2)}
              </Text>
              <AnimatedPressable
                hapticFeedback="light"
                onPress={() => {
                  setDraft(effectivePrice.toFixed(2));
                  setEditing(true);
                }}
                className="h-7 w-7 items-center justify-center rounded-full bg-background"
                accessibilityLabel="Edit recommended price"
              >
                <Pencil color="hsl(24 80% 48%)" size={14} />
              </AnimatedPressable>
            </View>
          )}
        </View>
      </View>

      {editing ? (
        <View className="mt-3 flex-row gap-2.5">
          <AnimatedPressable
            hapticFeedback="medium"
            onPress={handleSave}
            className="min-h-[44px] flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-primary"
          >
            <Check color="hsl(30 33% 98%)" size={17} strokeWidth={2.5} />
            <Text size="sm" weight="bold" className="text-primary-foreground">
              Save Price
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            hapticFeedback="light"
            onPress={() => setEditing(false)}
            className="min-h-[44px] items-center justify-center rounded-xl border border-border bg-background px-4"
          >
            <X color="hsl(24 10% 42%)" size={17} />
          </AnimatedPressable>
        </View>
      ) : isAdjusted ? (
        <View className="mt-2 flex-row items-center justify-between">
          <Text size="xs" variant="muted">
            AI suggested €{recommendedPrice.toFixed(2)}
          </Text>
          <Text size="xs" weight="medium" className="text-primary" onPress={() => onSave(null)}>
            Reset to AI price
          </Text>
        </View>
      ) : null}
    </View>
  );
}
