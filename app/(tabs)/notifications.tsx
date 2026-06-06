import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bell, BellOff } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function NotificationsScreen() {
  const { notifications, markNotificationsRead } = useStore();
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-2" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between">
          <Text size="3xl" weight="bold">
            Alerts
          </Text>
          {hasUnread ? (
            <Text
              size="sm"
              weight="semibold"
              className="text-primary"
              onPress={markNotificationsRead}
            >
              Mark all read
            </Text>
          ) : null}
        </View>

        {notifications.length === 0 ? (
          <View className="mt-24 items-center">
            <BellOff color="hsl(24 10% 42%)" size={40} />
            <Text variant="muted" className="mt-3">
              No alerts right now
            </Text>
          </View>
        ) : (
          <View className="mt-5 gap-3">
            {notifications.map((n, i) => (
              <Animated.View
                key={n.id}
                entering={FadeInDown.delay(i * 60).duration(350)}
                className={cn(
                  'flex-row items-start gap-3 rounded-2xl border p-4',
                  n.read ? 'border-border bg-card' : 'border-primary/30 bg-primary/10',
                )}
              >
                <View
                  className={cn(
                    'h-10 w-10 items-center justify-center rounded-full',
                    n.read ? 'bg-secondary' : 'bg-primary',
                  )}
                >
                  <Bell color={n.read ? 'hsl(24 10% 42%)' : 'hsl(30 33% 98%)'} size={18} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text weight="semibold" className={cn(!n.read && 'text-primary')}>
                      {n.title}
                    </Text>
                    <Text size="xs" variant="muted">
                      {n.time}
                    </Text>
                  </View>
                  <Text size="sm" variant="muted" className="mt-0.5">
                    {n.body}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
