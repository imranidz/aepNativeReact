import React, { useCallback } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { View, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { MobileCore } from '@adobe/react-native-aepcore';
import { useCart } from '../../components/CartContext';

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

  const { cart, incrementQuantity, decrementQuantity, removeFromCart } = useCart();

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Ionicons name="cart" size={48} color="#007AFF" />
      <ThemedText style={{ fontSize: 24, marginTop: 12, marginBottom: 24 }}>Cart</ThemedText>
      {cart.length === 0 ? (
        <ThemedText style={{ fontSize: 18, opacity: 0.7 }}>Your cart is empty.</ThemedText>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={item => `${item.category}-${item.name}`}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16, alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</ThemedText>
              <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>{item.category}</ThemedText>
              <ThemedText style={{ fontSize: 16 }}>Price: ${item.price.toFixed(2)}</ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <TouchableOpacity onPress={() => decrementQuantity(item.name, item.category)} style={{ marginHorizontal: 8, padding: 4 }}>
                  <ThemedText style={{ fontSize: 20 }}>-</ThemedText>
                </TouchableOpacity>
                <ThemedText style={{ fontSize: 16 }}>{item.quantity}</ThemedText>
                <TouchableOpacity onPress={() => incrementQuantity(item.name, item.category)} style={{ marginHorizontal: 8, padding: 4 }}>
                  <ThemedText style={{ fontSize: 20 }}>+</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromCart(item.name, item.category)} style={{ marginLeft: 16, padding: 4 }}>
                  <ThemedText style={{ fontSize: 16, color: 'red' }}>Remove</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </ThemedView>
  );
}
