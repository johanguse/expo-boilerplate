import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthManage from '@stores/auth.zustand';
import { Uniwind, useUniwind } from 'uniwind';

type NavItem = { label: string; route: string; icon: string; activeIcon: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', route: '/', icon: 'home-outline', activeIcon: 'home' },
  { label: 'Chat', route: '/chat', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
  { label: 'Explore', route: '/explore', icon: 'compass-outline', activeIcon: 'compass' },
  { label: 'Profile', route: '/profile', icon: 'person-circle-outline', activeIcon: 'person-circle' },
];

const FOOTER_ITEMS: NavItem[] = [
  { label: 'Settings', route: '/settings', icon: 'settings-outline', activeIcon: 'settings' },
];

type Props = { navigation: { closeDrawer: () => void } };

export function CustomDrawer({ navigation }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const user = useAuthManage((s) => s.user);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.slice(0, 2).toUpperCase() ?? '?');

  const handleNav = (route: string) => {
    router.push(route as never);
    navigation.closeDrawer();
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Uniwind.setTheme(isDark ? 'light' : 'dark');
  };

  const isActive = (route: string) =>
    route === '/' ? pathname === '/' : pathname.startsWith(route);

  const bg = isDark ? '#111' : '#fff';
  const textPrimary = isDark ? '#fff' : '#111';
  const textMuted = isDark ? '#888' : '#666';
  const activeBg = isDark ? 'rgba(0,122,255,0.12)' : 'rgba(0,122,255,0.08)';
  const dividerColor = isDark ? '#222' : '#f0f0f0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.profile}>
        <View style={[styles.avatar, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
          <Text style={[styles.avatarText, { color: textPrimary }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: textPrimary }]} numberOfLines={1}>
            {user?.name ?? 'User'}
          </Text>
          <Text style={[styles.email, { color: textMuted }]} numberOfLines={1}>
            {user?.email ?? ''}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.route);
          return (
            <Pressable
              key={item.route}
              onPress={() => handleNav(item.route)}
              style={[styles.navItem, active && { backgroundColor: activeBg }]}
            >
              <Ionicons
                name={(active ? item.activeIcon : item.icon) as never}
                size={22}
                color={active ? '#007AFF' : textMuted}
              />
              <Text style={[styles.navLabel, { color: active ? '#007AFF' : textPrimary }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <View style={[styles.footer, { borderTopColor: dividerColor }]}>
        {FOOTER_ITEMS.map((item) => {
          const active = isActive(item.route);
          return (
            <Pressable
              key={item.route}
              onPress={() => handleNav(item.route)}
              style={[styles.footerItem, active && { backgroundColor: activeBg }]}
            >
              <Ionicons
                name={(active ? item.activeIcon : item.icon) as never}
                size={20}
                color={active ? '#007AFF' : textMuted}
              />
              <Text style={[styles.footerLabel, { color: active ? '#007AFF' : textMuted }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={handleThemeToggle} style={styles.footerItem}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={textMuted}
          />
          <Text style={[styles.footerLabel, { color: textMuted }]}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '600' },
  name: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  email: { fontSize: 12 },
  divider: { height: 1, marginBottom: 16 },
  nav: { gap: 4 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
  },
  navLabel: { fontSize: 15, fontWeight: '500' },
  footer: { borderTopWidth: 1, paddingTop: 12, paddingBottom: 8, gap: 4 },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
  },
  footerLabel: { fontSize: 14 },
});
