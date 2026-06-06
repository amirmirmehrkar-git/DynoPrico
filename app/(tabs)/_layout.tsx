import { Tabs } from 'expo-router';
import { Home, Bell } from 'lucide-react-native';

import { useStore } from '@/lib/store';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NAV_THEME } from '@/lib/constants';

export default function TabLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
  const unread = useStore((s) => s.alerts.filter((n) => !n.read).length);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text + '99',
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.notification, fontSize: 10 },
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size ?? 22} />,
        }}
      />
    </Tabs>
  );
}
