import React, { useCallback } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { MobileCore } from '@adobe/react-native-aepcore';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
console.log('Rendering HomeTab'); 
const CATEGORIES = [
  { key: 'family', label: 'Family', description: 'Gear and essentials for family camping adventures.' },
  { key: 'men', label: "Men's", description: 'Outdoor apparel and equipment for men.' },
  { key: 'women', label: "Women's", description: 'Outdoor apparel and equipment for women.' },
  { key: 'travel', label: 'Travel', description: 'Lightweight and portable gear for travel.' },
  { key: 'experiences', label: 'Experiences', description: 'Book guided hikes, camping weekends, and more.' },
  { key: 'water', label: 'Water', description: 'Kayaks, dry bags, and water adventure gear.' },
  { key: 'desert', label: 'Desert', description: 'Gear for desert camping and sun protection.' },
  { key: 'mountain', label: 'Mountain', description: 'Equipment for mountain and alpine adventures.' },
];

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

export default function HomeTab() {
  useFocusEffect(
    useCallback(() => {
      MobileCore.trackState('HomeTab', {
        'web.webPageDetails.name': 'Home',
        'application.name': 'AEPSampleApp',
      });
    }, [])
  );

  const router = useRouter();
  const { colors } = useTheme();

  const handleCategoryPress = (categoryKey: string) => {
    const path = `/(consumerTabs)/_home/${categoryKey}`;
    console.log('HomeTab: Navigating to:', path);
    router.push(path as any);
  };

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleCategoryPress(item.key)}>
      <Ionicons name={CATEGORY_ICONS[item.key] as any || 'cube'} size={32} color={colors.primary} style={{ position: 'absolute', left: 32, top: 36, zIndex: 2 }} />
      <View style={[styles.cardImage, { backgroundColor: '#e3eaf3' }]} />
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.cardTitle}>{item.label}</ThemedText>
        <ThemedText style={styles.cardDescription}>{item.description}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedText style={styles.header}>Explore Camping & Hiking</ThemedText>
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
