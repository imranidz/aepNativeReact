import productsData from '../../productData/bootcamp_products.json';

const PRODUCT_ICONS: { [key: string]: any } = {
  // Family
  'Family Tent (6-person)': 'home',
  'Family Sleeping Bag Set': 'bed',
  'Family Camping Cookware': 'restaurant',
  "Kids' Hiking Boots": 'walk',
  // Men
  "Men's Hiking Boots": 'walk',
  "Men's Waterproof Jacket": 'rainy',
  "Men's Trekking Pants": 'body',
  "Men's Base Layer Shirt": 'shirt',
  // Women
  "Women's Hiking Boots": 'walk',
  "Women's Insulated Jacket": 'snow',
  "Women's Hiking Backpack": 'briefcase',
  "Women's Quick-Dry Pants": 'body',
  // Travel
  'Lightweight Travel Backpack': 'briefcase',
  'Packable Rain Jacket': 'rainy',
  'Travel Hammock': 'bed',
  'Portable Water Filter': 'water',
  // Experiences
  'Guided Mountain Hike': 'trail-sign',
  'Family Camping Weekend': 'bonfire',
  'Desert Survival Course': 'sunny',
  'Kayak Adventure Tour': 'boat',
  // Water
  'Inflatable Kayak': 'boat',
  'Waterproof Dry Bag': 'water',
  'Water Purification Tablets': 'water',
  'Fishing Kit': 'fish',
  // Desert
  'Desert Tent': 'home',
  'Sun Protection Hat': 'sunny',
  'Hydration Pack': 'water',
  'Sand-Proof Blanket': 'bed',
  // Mountain
  'Mountaineering Boots': 'walk',
  'Crampons': 'snow',
  'Down Sleeping Bag': 'bed',
  'Avalanche Safety Kit': 'alert',
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const options = {
  tabBarButton: () => null,
};

import React from 'react';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedText } from '../../../components/ThemedText';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CategoryProductList() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  // Filter products by category
  const products = productsData.filter(product => product.product.categories.primary.toLowerCase() === category?.toLowerCase());

  const handleProductPress = (productName: string) => {
    const path = `/(consumerTabs)/_home/${category}/${slugify(productName)}`;
    router.push(path as any);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleProductPress(item.product.name)}>
      <Ionicons name={PRODUCT_ICONS[item.product.name] || 'cube'} size={28} color={colors.primary} style={{ position: 'absolute', left: 32, top: 36, zIndex: 2 }} />
      <View style={[styles.cardImage, { backgroundColor: '#e3eaf3' }]} />
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.cardTitle}>{item.product.name}</ThemedText>
        <ThemedText style={styles.cardDescription}>{item.product.categories.secondary}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedText style={styles.header}>{category ? category.charAt(0).toUpperCase() + category.slice(1) : ''} Products</ThemedText>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.sku}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
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
    borderRadius: 12,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  },
}); 