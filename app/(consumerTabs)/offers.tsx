import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function OffersTab() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="gift" size={48} color="#007AFF" />
      <Text style={{ fontSize: 24, marginTop: 12 }}>Offers</Text>
    </View>
  );
}
