import React, { useState, useEffect, useCallback } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MobileCore } from '@adobe/react-native-aepcore';
import { useCart } from '../../components/CartContext';
import { useProfileStorage } from '../../hooks/useProfileStorage';

type RootStackParamList = {
  home: undefined;
};

export default function Checkout() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const { clearCart, cart } = useCart();
  const { profile } = useProfileStorage();
  //console.log('Profile from storage:', profile);

  useFocusEffect(
    useCallback(() => {
      MobileCore.trackAction('pageView', {
        'page.name': 'Checkout',
        'page.category': 'Consumer',
        'page.type': 'Checkout View',
        'user.journey': 'Navigation',
        'cart.totalValue': cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2),
        'cart.itemCount': cart.length,
      });
    }, [cart])
  );

  useEffect(() => {
    //console.log('Profile firstName:', profile.firstName);
    //console.log('Profile email:', profile.email);
    setFirstName(profile.firstName);
    setEmail(profile.email);
  }, [profile]);

  const handlePayment = () => {
    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    MobileCore.trackAction('payNow', {
      'payment.method': 'credit card',
      'payment.amount': totalAmount, // Use dynamic total amount
    });
    setShowConfetti(true);
    setTimeout(() => {
      navigation.navigate('home');
      setShowConfetti(false);
      clearCart();
    }, 3000);
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, alignSelf: 'flex-start', marginBottom: 16 }}>
        <ThemedText style={{ color: colors.primary }}>Back</ThemedText>
      </TouchableOpacity>
      <ThemedText style={styles.header}>Checkout</ThemedText>
      <View style={styles.section}>
        
        <ThemedText style={styles.shippingInfoTitle}>Shipping Information</ThemedText>
        <ThemedText style={styles.shippingInfoText}>Name: {firstName}</ThemedText>
        <ThemedText style={styles.shippingInfoText}>Email: {email}</ThemedText>
        <ThemedText style={styles.shippingInfoText}>Address: 42 Treehouse Lane, Enchanted Forest</ThemedText>
        <ThemedText style={styles.shippingInfoText}>City: Mystical Woods</ThemedText>
        <ThemedText style={styles.shippingInfoText}>State: Tranquility</ThemedText>
        <ThemedText style={styles.shippingInfoText}>Zip: 00000</ThemedText>
        <ThemedText style={styles.shippingInfoText}>Contact: (555) 123-4567</ThemedText>
      </View>
      <View style={styles.section}>
        <ThemedText style={styles.paymentInfoTitle}>Payment Details</ThemedText>
        <ThemedText style={styles.paymentInfoText}>Cardholder: Rainbow Sunshine</ThemedText>
        <ThemedText style={styles.paymentInfoText}>Card Number: 1234 5678 9012 3456</ThemedText>
        <ThemedText style={styles.paymentInfoText}>Expiry Date: 12/34</ThemedText>
        <ThemedText style={styles.paymentInfoText}>CVV: 007</ThemedText>
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handlePayment}>
        <ThemedText style={styles.buttonText}>Pay Now</ThemedText>
      </TouchableOpacity>
      {showConfetti && <ConfettiCannon count={200} origin={{x: -10, y: 0}} fadeOut={true} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  shippingInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  shippingInfoText: {
    marginBottom: 8,
  },
  paymentInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paymentInfoText: {
    marginBottom: 8,
  },
}); 