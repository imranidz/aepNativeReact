import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { MobileCore } from '@adobe/react-native-aepcore';

export default function CartTab() {
  useFocusEffect(
    useCallback(() => {
      MobileCore.trackState('CartTab', {
        'web.webPageDetails.name': 'Cart',
        'application.name': 'AEPSampleApp',
      });
      console.log('CartTab viewed - trigger Adobe tracking here');
    }, [])
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="cart" size={48} color="#007AFF" />
      <Text style={{ fontSize: 24, marginTop: 12 }}>Cart</Text>
    </View>
  );
}
