import React, { useCallback } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { MobileCore } from '@adobe/react-native-aepcore';

export default function OffersTab() {
  useFocusEffect(
    useCallback(() => {
      MobileCore.trackState('OffersTab', {
        'web.webPageDetails.name': 'Offers',
        'application.name': 'AEPSampleApp',
      });
      console.log('OffersTab viewed - trigger Adobe tracking here');
    }, [])
  );

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="gift" size={48} color="#007AFF" />
      <ThemedText style={{ fontSize: 24, marginTop: 12 }}>Offers</ThemedText>
    </ThemedView>
  );
}
