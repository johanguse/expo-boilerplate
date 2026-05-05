import { Tabs } from 'expo-router';
import { LiquidGlassTabs } from '@/components/LiquidGlassTabs';

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <LiquidGlassTabs {...props} />}>
      <Tabs.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
      <Tabs.Screen name="chat" options={{ headerShown: false, title: 'Chat' }} />
      <Tabs.Screen name="explore" options={{ headerShown: false, title: 'Explore' }} />
      <Tabs.Screen name="profile" options={{ headerShown: false, title: 'Profile' }} />
      <Tabs.Screen name="settings" options={{ href: null, headerShown: false, title: 'Settings' }} />
    </Tabs>
  );
}
