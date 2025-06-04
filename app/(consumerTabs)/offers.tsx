import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="gift" size={48} color="#007AFF" />
      <Text style={{ fontSize: 24, marginTop: 12 }}>Offers</Text>
    </View>
  );
}
