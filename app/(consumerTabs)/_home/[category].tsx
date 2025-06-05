const CATEGORY_OPTIONS: { [key: string]: { name: string; description?: string }[] } = {
  family: [
    { name: "Family Tent (6-person)", description: 'Spacious tent for the whole family.' },
    { name: "Family Sleeping Bag Set", description: 'Warm sleeping bags for all ages.' },
    { name: "Family Camping Cookware", description: 'Cookware set for group meals.' },
    { name: "Kids' Hiking Boots", description: 'Durable boots for young adventurers.' },
  ],
  men: [
    { name: "Men's Hiking Boots", description: 'Rugged boots for tough terrain.' },
    { name: "Men's Waterproof Jacket", description: 'Stay dry in any weather.' },
    { name: "Men's Trekking Pants", description: 'Comfortable and flexible.' },
    { name: "Men's Base Layer Shirt", description: 'Moisture-wicking base layer.' },
  ],
  women: [
    { name: "Women's Hiking Boots", description: 'Supportive boots for women.' },
    { name: "Women's Insulated Jacket", description: 'Warmth without the weight.' },
    { name: "Women's Hiking Backpack", description: 'Ergonomic and stylish.' },
    { name: "Women's Quick-Dry Pants", description: 'Stay cool and dry.' },
  ],
  travel: [
    { name: 'Lightweight Travel Backpack', description: 'Perfect for on-the-go.' },
    { name: 'Packable Rain Jacket', description: 'Easy to pack, keeps you dry.' },
    { name: 'Travel Hammock', description: 'Relax anywhere.' },
    { name: 'Portable Water Filter', description: 'Clean water anywhere.' },
  ],
  experiences: [
    { name: 'Guided Mountain Hike', description: 'Expert-led adventure.' },
    { name: 'Family Camping Weekend', description: 'Fun for all ages.' },
    { name: 'Desert Survival Course', description: 'Learn essential skills.' },
    { name: 'Kayak Adventure Tour', description: 'Explore by water.' },
  ],
  water: [
    { name: 'Inflatable Kayak', description: 'Easy to transport.' },
    { name: 'Waterproof Dry Bag', description: 'Keep your gear dry.' },
    { name: 'Water Purification Tablets', description: 'Safe drinking water.' },
    { name: 'Fishing Kit', description: 'All-in-one kit.' },
  ],
  desert: [
    { name: 'Desert Tent', description: 'Designed for hot climates.' },
    { name: 'Sun Protection Hat', description: 'Stay cool and protected.' },
    { name: 'Hydration Pack', description: 'Stay hydrated on the go.' },
    { name: 'Sand-Proof Blanket', description: 'Perfect for the dunes.' },
  ],
  mountain: [
    { name: 'Mountaineering Boots', description: 'For the highest peaks.' },
    { name: 'Crampons', description: 'Essential for ice and snow.' },
    { name: 'Down Sleeping Bag', description: 'Warmth at altitude.' },
    { name: 'Avalanche Safety Kit', description: 'Be prepared.' },
  ],
};

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
  const products = CATEGORY_OPTIONS[category ?? ''] || [];
  const { colors } = useTheme();

  console.log('Rendering CategoryProductList');

  console.log('CategoryProductList: useLocalSearchParams category:', category);
  console.log('CategoryProductList: products:', products);

  const handleProductPress = (productName: string) => {
    const path = `/(consumerTabs)/_home/${category}/${slugify(productName)}`;
    console.log('CategoryProductList: Navigating to product:', path);
    router.push(path as any);
  };

  const handleCategoryPress = (categoryKey: string) => {
    const path = `/(consumerTabs)/_home/${categoryKey}`;
    console.log('HomeTab: Navigating to:', path);
    router.push(path as any);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleProductPress(item.name)}>
      <Ionicons name={PRODUCT_ICONS[item.name] || 'cube'} size={28} color={colors.primary} style={{ position: 'absolute', left: 32, top: 36, zIndex: 2 }} />
      <View style={[styles.cardImage, { backgroundColor: '#e3eaf3' }]} />
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
        <ThemedText style={styles.cardDescription}>{item.description}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedText style={styles.header}>{category ? category.charAt(0).toUpperCase() + category.slice(1) : ''} Products</ThemedText>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.name}
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