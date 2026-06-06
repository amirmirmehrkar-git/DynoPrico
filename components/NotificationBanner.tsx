import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bell } from 'lucide-react-native';

import { Text } from '@/components/ui/text';

interface NotificationBannerProps {
  title: string;
  body: string;
}

export function NotificationBanner({ title, body }: NotificationBannerProps) {
  return (
    <Animated.View entering={FadeInDown.duration(400).springify().damping(16)}>
      <View className="flex-row items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
          <Bell color="hsl(30 33% 98%)" size={20} />
        </View>
        <View className="flex-1">
          <Text size="sm" weight="semibold" className="text-primary">
            {title}
          </Text>
          <Text size="sm" variant="muted" className="mt-0.5">
            {body}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
