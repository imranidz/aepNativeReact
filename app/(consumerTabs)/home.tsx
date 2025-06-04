import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import {
  MobileCore,
  Lifecycle,
  Signal,
  Event,
  Identity,
  LogLevel,
  PrivacyStatus,
} from '@adobe/react-native-aepcore';

export default function HomeTab() {
  useFocusEffect(
    useCallback(() => {
       MobileCore.trackState('HomeTab', {
        'web.webPageDetails.name': 'Home',
        'application.name': 'DSS Mobile App',
        // ...other fields as per your schema
      });
      console.log('HomeTab viewed, tracking call made');
    }, [])
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="home" size={48} color="#007AFF" />
      <Text style={{ fontSize: 24, marginTop: 12 }}>Home</Text>
    </View>
  );
}
