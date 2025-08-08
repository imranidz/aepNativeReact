import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartTabBarIcon } from '../../components/navigation/TabBarIcon';

// Define your navigation types
export type RootStackParamList = {
  shop: undefined;
  offers: undefined;
  cart: undefined;
  profile: undefined;
  Checkout: undefined; // Ensure this matches your route name
};

export default function ConsumerTabsLayout() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <Tabs>
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Offers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <CartTabBarIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
      

      <Tabs.Screen
        name="+not-found"
        options={{
          tabBarButton: () => null,
        }}
      />

      <Tabs.Screen
        name="_home/[category]/[product]"
        options={{
          tabBarButton: () => null,
        }}
      />

<Tabs.Screen
        name="_home/[category]"
        options={{
          tabBarButton: () => null,
        }}
      />

<Tabs.Screen
        name="Checkout"
        options={{
          tabBarButton: () => null,
        }}
      />



    </Tabs>
    
    
  );
}