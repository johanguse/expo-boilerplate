import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawer } from '@/components/CustomDrawer';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          drawerStyle: { width: 270 },
          overlayColor: 'rgba(0,0,0,0.5)',
          swipeEnabled: true,
          swipeEdgeWidth: 40,
        }}
        drawerContent={(props) => <CustomDrawer {...props} />}
      >
        <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Home' }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
