import React, { createContext, useContext, useState } from 'react';
import { ProfileProvider } from './components/ProfileContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useProfile } from '../../components/ProfileContext';

import CategoryProductList from './app/(consumerTabs)/_home/[category]';
import ProductDetail from './app/(consumerTabs)/_home/[category]/[product]';
import Offers from './app/(consumerTabs)/offers'; // Adjust the path as necessary
import Checkout from './app/(consumerTabs)/Checkout';
import HomeTab from './app/(consumerTabs)/home';
import CartTab from './app/(consumerTabs)/cart';
import ProfileTab from './app/(consumerTabs)/profile';

const Stack = createStackNavigator();

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({ firstName: '', email: '' });

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);
};

export default function App() {
  return (
    <ProfileProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeTab} />
          <Stack.Screen name="Cart" component={CartTab} />
          <Stack.Screen name="CategoryProductList" component={CategoryProductList} />
          <Stack.Screen name="ProductDetail" component={ProductDetail} />
          <Stack.Screen name="Checkout" component={Checkout} />
          <Stack.Screen name="Profile" component={ProfileTab} />
          <Stack.Screen name="Offers" component={Offers} />
        </Stack.Navigator>
      </NavigationContainer>
    </ProfileProvider>
  );
} 