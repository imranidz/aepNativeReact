import React, { useCallback, useEffect, useState } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useTheme, useNavigation } from '@react-navigation/native';
import { MobileCore } from '@adobe/react-native-aepcore';
import { useCart } from '../../components/CartContext';
import { PRODUCT_IMAGES } from './_home/[category]';
import { Identity } from '@adobe/react-native-aepedgeidentity';

export default function CartTab() {
  const navigation = useNavigation();

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
    list: {
      padding: 16,
    },
  });

  const { cart, incrementQuantity, decrementQuantity, removeFromCart } = useCart();

  const modifiedCart = cart.map(item => ({ ...item, sku: item.sku || 'defaultSku' }));

  const [identityMap, setIdentityMap] = useState({});

  useEffect(() => {
    // Fetch Identity Map
    Identity.getIdentities().then(setIdentityMap);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const totalValue = modifiedCart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
      const itemCount = modifiedCart.length;
      MobileCore.trackState('CartTab', {
        'cart.totalValue': totalValue.toString(),
        'cart.itemCount': itemCount.toString(),
        'user.identityMap': JSON.stringify(identityMap),
        'timestamp': new Date().toISOString()
      });
    }, [modifiedCart, identityMap])
  );

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Ionicons name="cart" size={48} color="#007AFF" />
      <ThemedText style={{ fontSize: 24, marginTop: 12, marginBottom: 24 }}>Cart</ThemedText>
      {cart.length === 0 ? (
        <ThemedText style={{ fontSize: 18, opacity: 0.7 }}>Your cart is empty.</ThemedText>
      ) : (
        <>
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
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>Total: ${modifiedCart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</ThemedText>
          <TouchableOpacity style={{ marginTop: 16, paddingVertical: 12, paddingHorizontal: 32, backgroundColor: colors.primary, borderRadius: 8 }} onPress={() => {
            MobileCore.trackAction('checkout', {
              'cart.totalValue': modifiedCart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2),
              'cart.itemCount': modifiedCart.length,
            });
            navigation.navigate('Checkout');
          }}>
            <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Checkout</ThemedText>
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );
}
