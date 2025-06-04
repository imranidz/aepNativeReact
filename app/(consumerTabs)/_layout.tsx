import { Tabs } from 'expo-router';

export default function ConsumerTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'Home' /* tabBarIcon: ... */ }} />
      <Tabs.Screen name="offers" options={{ title: 'Offers' /* tabBarIcon: ... */ }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart' /* tabBarIcon: ... */ }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' /* tabBarIcon: ... */ }} />
    </Tabs>
  );
}