import React, { useCallback } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { View } from 'react-native';
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
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="cart" size={48} color="#007AFF" />
      <ThemedText style={{ fontSize: 24, marginTop: 12 }}>Cart</ThemedText>
    </ThemedView>
  );
}
