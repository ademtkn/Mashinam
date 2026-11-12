import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Compass, Heart, SquarePlus, UserRound } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useFavorites } from '../../context/FavoritesContext';
import { useLang } from '../../context/LanguageContext';

export default function TabsLayout() {
  const { ids } = useFavorites();
  const { t } = useLang();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.amber,
        tabBarInactiveTintColor: Colors.textFaint,
        tabBarStyle: {
          backgroundColor: Colors.navy,
          borderTopColor: 'rgba(255,255,255,0.08)',
          // Web's default bar is too short for bold labels and clips them.
          ...(Platform.OS === 'web' && { height: 68, paddingTop: 4, paddingBottom: 6 }),
        },
        tabBarLabelStyle: { fontSize: 11, lineHeight: 15, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tab.explore'), tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="sell"
        options={{ title: t('tab.sell'), tabBarIcon: ({ color, size }) => <SquarePlus color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('tab.favorites'),
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
          tabBarBadge: ids.size > 0 ? ids.size : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.danger, color: Colors.white, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tab.profile'), tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }}
      />
    </Tabs>
  );
}
