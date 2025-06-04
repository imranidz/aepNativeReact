import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MobileCore } from '@adobe/react-native-aepcore';
import { useRouter } from 'expo-router';
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

  const handleCategoryPress = (categoryKey: string) => {
    const path = `/(consumerTabs)/_home/${categoryKey}`;
    console.log('HomeTab: Navigating to:', path);
    router.push(path as any);
  };

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCategoryPress(item.key)}>
      {/* Placeholder for image: replace with <Image source={require('...')} style={styles.cardImage} /> */}
      <View style={styles.cardImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.label}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <Text style={styles.header}>Explore Camping & Hiking</Text>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 16,
    textAlign: 'center',
    color: '#2e3d49',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    backgroundColor: '#cce3de',
    borderRadius: 12,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e3d49',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4a5a6a',
  },
});
