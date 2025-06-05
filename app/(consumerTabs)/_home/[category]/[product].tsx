const CATEGORY_OPTIONS: { [key: string]: { name: string; description?: string; price: number }[] } = {
  family: [
    { name: "Family Tent (6-person)", description: 'Spacious tent for the whole family.', price: 299.99 },
    { name: "Family Sleeping Bag Set", description: 'Warm sleeping bags for all ages.', price: 149.99 },
    { name: "Family Camping Cookware", description: 'Cookware set for group meals.', price: 89.99 },
    { name: "Kids' Hiking Boots", description: 'Durable boots for young adventurers.', price: 59.99 },
  ],
  men: [
    { name: "Men's Hiking Boots", description: 'Rugged boots for tough terrain.', price: 129.99 },
    { name: "Men's Waterproof Jacket", description: 'Stay dry in any weather.', price: 109.99 },
    { name: "Men's Trekking Pants", description: 'Comfortable and flexible.', price: 79.99 },
    { name: "Men's Base Layer Shirt", description: 'Moisture-wicking base layer.', price: 39.99 },
  ],
  women: [
    { name: "Women's Hiking Boots", description: 'Supportive boots for women.', price: 124.99 },
    { name: "Women's Insulated Jacket", description: 'Warmth without the weight.', price: 119.99 },
    { name: "Women's Hiking Backpack", description: 'Ergonomic and stylish.', price: 99.99 },
    { name: "Women's Quick-Dry Pants", description: 'Stay cool and dry.', price: 69.99 },
  ],
  travel: [
    { name: 'Lightweight Travel Backpack', description: 'Perfect for on-the-go.', price: 89.99 },
    { name: 'Packable Rain Jacket', description: 'Easy to pack, keeps you dry.', price: 59.99 },
    { name: 'Travel Hammock', description: 'Relax anywhere.', price: 39.99 },
    { name: 'Portable Water Filter', description: 'Clean water anywhere.', price: 29.99 },
  ],
  experiences: [
    { name: 'Guided Mountain Hike', description: 'Expert-led adventure.', price: 199.99 },
    { name: 'Family Camping Weekend', description: 'Fun for all ages.', price: 349.99 },
    { name: 'Desert Survival Course', description: 'Learn essential skills.', price: 249.99 },
    { name: 'Kayak Adventure Tour', description: 'Explore by water.', price: 179.99 },
  ],
  water: [
    { name: 'Inflatable Kayak', description: 'Easy to transport.', price: 249.99 },
    { name: 'Waterproof Dry Bag', description: 'Keep your gear dry.', price: 24.99 },
    { name: 'Water Purification Tablets', description: 'Safe drinking water.', price: 14.99 },
    { name: 'Fishing Kit', description: 'All-in-one kit.', price: 34.99 },
  ],
  desert: [
    { name: 'Desert Tent', description: 'Designed for hot climates.', price: 219.99 },
    { name: 'Sun Protection Hat', description: 'Stay cool and protected.', price: 19.99 },
    { name: 'Hydration Pack', description: 'Stay hydrated on the go.', price: 44.99 },
    { name: 'Sand-Proof Blanket', description: 'Perfect for the dunes.', price: 29.99 },
  ],
  mountain: [
    { name: 'Mountaineering Boots', description: 'For the highest peaks.', price: 189.99 },
    { name: 'Crampons', description: 'Essential for ice and snow.', price: 59.99 },
    { name: 'Down Sleeping Bag', description: 'Warmth at altitude.', price: 159.99 },
    { name: 'Avalanche Safety Kit', description: 'Be prepared.', price: 99.99 },
  ]
  // ... (other categories, copy from your [category].tsx)
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const options = {
  tabBarButton: () => null,
};

import React, { useState } from 'react';
import { ThemedView } from '../../../../components/ThemedView';
import { ThemedText } from '../../../../components/ThemedText';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MobileCore } from '@adobe/react-native-aepcore';
import { useTheme } from '@react-navigation/native';


export default function ProductDetail() {
  const { category, product } = useLocalSearchParams<{ category: string; product: string }>();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const { colors } = useTheme();

  // Find the product in the category
  const products = CATEGORY_OPTIONS[category ?? ''] || [];
  const productData = products.find(
    (p) => slugify(p.name) === product
  );

  console.log({ category, product, products });

  if (!productData) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Product not found.</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>{'< Back'}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleAddToCart = () => {
    setAdded(true);
    console.log('Add to Cart:', { category, product, productData });
    // Analytics tracking for add to cart
    MobileCore.trackAction('addToCart', {
      'product.name': productData.name,
      'product.category': category,
      'product.price': productData.price,
      'product.description': productData.description,
      'cart.action': 'add',
    });
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ThemedText style={styles.backButtonText}>{'< Back'}</ThemedText>
      </TouchableOpacity>
      <View style={styles.image} />
      <ThemedText style={styles.title}>{productData.name}</ThemedText>
      <ThemedText style={styles.description}>{productData.description}</ThemedText>
      <ThemedText style={styles.price}>${productData.price.toFixed(2)}</ThemedText>
      <TouchableOpacity
        style={[
          styles.addToCartButton,
          { backgroundColor: added ? (colors.notification || '#4caf50') : colors.primary },
        ]}
        onPress={handleAddToCart}
        disabled={added}
      >
        <ThemedText style={styles.addToCartText}>{added ? 'Added!' : 'Add to Cart'}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 160,
    height: 160,
    backgroundColor: '#cce3de',
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  addToCartButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  addToCartText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  added: {
  },
}); 