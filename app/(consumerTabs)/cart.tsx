import React, { useCallback } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { MobileCore } from '@adobe/react-native-aepcore';
import { useCart } from '../../components/CartContext';
import { PRODUCT_IMAGES } from './_home/[category]';

export default function CartTab() {
  useFocusEffect(
    useCallback(() => {
      MobileCore.trackState('CartTab', {
        'cart.totalValue': '150.00',
        'cart.itemCount': '3',
        'user.id': 'user123',
        'timestamp': new Date().toISOString()
      });
      console.log('CartTab viewed - trigger Adobe tracking here');
    }, [])
  );

  const { colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      marginVertical: 8,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    cardImage: {
      width: 64,
      height: 64,
      position: 'absolute',
      left: 16,
      top: 16,
      zIndex: 2,
      borderRadius: 12,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    cardDescription: {
      fontSize: 14,
      opacity: 0.7,
    },
  });

  const { cart, incrementQuantity, decrementQuantity, removeFromCart } = useCart();

  const modifiedCart = cart.map(item => ({ ...item, sku: item.sku || 'defaultSku' }));

  const placeholderCart = [
    { sku: 'placeholder1', name: 'Product 1', category: 'Category 1', price: 10.00, quantity: 1 },
    { sku: 'placeholder2', name: 'Product 2', category: 'Category 2', price: 20.00, quantity: 2 },
    { sku: 'placeholder3', name: 'Product 3', category: 'Category 3', price: 30.00, quantity: 3 },
  ];

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Ionicons name="cart" size={48} color="#007AFF" />
      <ThemedText style={{ fontSize: 24, marginTop: 12, marginBottom: 24 }}>Cart</ThemedText>
      {cart.length === 0 ? (
        <ThemedText style={{ fontSize: 18, opacity: 0.7 }}>Your cart is empty.</ThemedText>
      ) : (
        <FlatList
          data={modifiedCart}
          keyExtractor={item => `${item.category}-${item.name}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, flexDirection: 'row' }]} onPress={() => console.log('Item pressed:', item.name)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={PRODUCT_IMAGES[item.sku]}
                  style={{ width: 64, height: 64, borderRadius: 12, marginRight: 16 }}
                  onError={(error) => console.error('Error loading image for SKU:', item.sku, error)}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
                  <ThemedText style={styles.cardDescription}>{item.category}</ThemedText>
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
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ThemedView>
  );
}
