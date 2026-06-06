import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BellOff } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { AlertCard } from '@/components/AlertCard';
import { useStore } from '@/lib/store';

export default function AlertsScreen() {
  const router = useRouter();
  const alerts = useStore((s) => s.alerts);
  const markAlertsRead = useStore((s) => s.markAlertsRead);
  const hasUnread = alerts.some((n) => !n.read);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-2" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text size="3xl" weight="bold">
              Alerts
            </Text>
            <Text size="sm" variant="muted" className="mt-0.5">
              {alerts.filter((a) => !a.read).length} unread
            </Text>
          </View>
          {hasUnread ? (
            <Text size="sm" weight="semibold" className="text-primary" onPress={markAlertsRead}>
              Mark all read
            </Text>
          ) : null}
        </View>

        {alerts.length === 0 ? (
          <View className="mt-24 items-center">
            <BellOff color="hsl(24 10% 42%)" size={40} />
            <Text variant="muted" className="mt-3">
              No alerts right now
            </Text>
          </View>
        ) : (
          <View className="mt-5 gap-3">
            {alerts.map((alert, i) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                index={i}
                onPressRelated={
                  alert.recommendationId
                    ? () => router.push(`/recommendation/${alert.recommendationId}`)
                    : undefined
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
