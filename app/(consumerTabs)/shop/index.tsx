import React, { useCallback } from 'react';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedText } from '../../../components/ThemedText';
import { View, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useFocusEffect, useTheme, useNavigationState } from '@react-navigation/native';
import { MobileCore } from '@adobe/react-native-aepcore';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import productsData from '../../productData/bootcamp_products.json';

// Extract unique categories from the JSON data
const CATEGORIES: { key: string; label: string; description: string }[] = Array.from(new Set(productsData.map(product => product.product.categories.primary))).map(category => ({
  key: category.toLowerCase(),
  label: category.charAt(0).toUpperCase() + category.slice(1),
  description: `${category} related products.`
}));

const CATEGORY_IMAGES: { [key: string]: any } = {
  men: require('../../../assets/images/productImages/mtnman.jpeg'),
  women: require('../../../assets/images/productImages/mtnwomen.jpeg'),
  equipment: require('../../../assets/images/productImages/mtnequipment.jpeg'),
};

const CATEGORY_ICONS: { [key: string]: string } = {
  family: 'people',
  men: 'man',
  women: 'woman',
  travel: 'airplane',
  experiences: 'walk',
  water: 'water',
  desert: 'sunny',
  mountain: 'trail-sign',
};

export default function ShopTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const navigationState = useNavigationState(state => state);
  const previousRouteName = navigationState.routes[navigationState.index - 1]?.name || 'Unknown';

  useFocusEffect(
    useCallback(() => {
      console.log('ShopTab: Focus effect triggered, navigation state:', {
        routes: navigationState.routes.map(r => r.name),
        index: navigationState.index,
        previousRouteName
      });
      
      MobileCore.trackState('ShopTab', {
        'view.name': 'Shop',
        'navigation.previousView': previousRouteName,
        'application.name': 'WeRetailMobileApp',
        'timestamp': new Date().toISOString(),
      });
    }, [previousRouteName, navigationState.routes, navigationState.index])
  );

  const handleCategoryPress = (categoryKey: string) => {
    const path = `/(consumerTabs)/shop/_home/${categoryKey}`;
    console.log('ShopTab: Navigating to:', path);
    router.push(path as any);
  };

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleCategoryPress(item.key)}>
      <Image
        source={CATEGORY_IMAGES[item.key]}
        style={{ width: 64, height: 64, position: 'absolute', left: 16, top: 16, zIndex: 2, borderRadius: 12 }}
        onError={(error) => console.error('Error loading image for category:', item.key, error)}
      />
      <View style={[styles.cardImage, { backgroundColor: '#e3eaf3' }]} />
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.cardTitle}>{item.label}</ThemedText>
        <ThemedText style={styles.cardDescription}>{item.description}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedText style={styles.header}>WeRetail</ThemedText>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={item => item.key}
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
    overflow: 'hidden', // Ensure the image is clipped to the border radius
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
