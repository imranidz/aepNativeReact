import React, { useCallback, useEffect, useState } from 'react';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { View, TouchableOpacity, StyleSheet, Button, Image, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';
import { MobileCore } from '@adobe/react-native-aepcore';
import { Optimize, DecisionScope, Proposition } from '@adobe/react-native-aepoptimize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Identity, IdentityMap, AuthenticatedState } from '@adobe/react-native-aepedgeidentity';
import { useCart } from '../../components/CartContext';

const PROFILE_KEY = 'userProfile';
const DECISION_SCOPE_KEY = 'optimize_decision_scope';

export function useProfileStorage() {
  const [profile, setProfile] = useState({ firstName: '', email: '' });
  const [decisionScope, setDecisionScope] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
        const storedScope = await AsyncStorage.getItem(DECISION_SCOPE_KEY);
        if (storedScope) {
          setDecisionScope(storedScope);
          console.log('Decision scope loaded from AsyncStorage:', storedScope);
        }
      } catch (error) {
        console.error('Failed to load data from storage:', error);
      } finally {
        setIsLoading(false);
        console.log('Loading complete, isLoading set to false');
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async (newProfile: { firstName: string; email: string }) => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Failed to save profile to storage:', error);
    }
  };

  const saveDecisionScope = async (scope: string) => {
    try {
      await AsyncStorage.setItem(DECISION_SCOPE_KEY, scope);
      setDecisionScope(scope);
    } catch (error) {
      console.error('Failed to save decision scope to storage:', error);
    }
  };

  return { profile, setProfile, decisionScope, setDecisionScope };
}

// Define a type for offers
interface Offer {
  title: string;
  text: string;
  image: string;
  price: number;
  name: string; // Add name property
  category: string; // Make category required
  sku: string; // Make sku required to match CartItem
}

const OfferCard = ({ offer, styles, colors, addToCart }: { offer: Offer, styles: any, colors: any, addToCart: (offer: Offer) => void }) => {
  return (
    <View style={[styles.card, { alignItems: 'center', backgroundColor: colors.card, padding: 16, width: '100%' }]}>
      <Image
        source={{ uri: offer.image }}
        style={{ width: 64, height: 64, borderRadius: 12, marginBottom: 16, marginRight: 16 }}
        onError={(error) => console.error('Error loading image for offer:', offer.title, error)}
      />
      <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', width: '80%' }}>
        <ThemedText style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4, textAlign: 'left' }}>{offer.title}</ThemedText>
        <ThemedText style={{ color: colors.text, fontSize: 14, textAlign: 'left' }}>{offer.text}</ThemedText>
        <ThemedText style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginTop: 4, textAlign: 'left' }}>${offer.price.toFixed(2)}</ThemedText>
        <TouchableOpacity onPress={() => addToCart({
          name: offer.title || 'Unnamed Offer',
          title: offer.title,
          category: offer.category || 'defaultCategory',
          sku: offer.sku || 'defaultSku',
          price: offer.price,
          text: offer.text,
          image: offer.image
        })} style={{ marginTop: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.primary, borderRadius: 8 }}>
          <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Add to Cart</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function OffersTab() {
  const { colors } = useTheme();
  const { profile, setProfile, decisionScope, setDecisionScope } = useProfileStorage();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

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
      backgroundColor: colors.card,
    },
    cardImage: {
      width: 64,
      height: 64,
      borderRadius: 12,
      position: 'absolute',
      left: 16,
      top: 16,
      zIndex: 2,
      overflow: 'hidden',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
      color: colors.text,
    },
    cardDescription: {
      fontSize: 14,
      opacity: 0.7,
    },
    list: {
      padding: 16,
    },
  });

  useEffect(() => {
    console.log('OffersTab view loaded'); // Log when the view is loaded

    // Ensure SDK is fully initialized
    const ensureSDKInitialized = async () => {
      console.log('Ensuring SDK is fully initialized...');
      try {
        const sdkReady = true; // Replace with actual check
        if (!sdkReady) {
          console.error('SDK is not fully ready');
          return;
        }
        console.log('SDK is fully initialized');
      } catch (error) {
        console.error('Error during SDK initialization check:', error);
      }
    };

    ensureSDKInitialized();

    // Subscribe to proposition updates
    Optimize.onPropositionUpdate({
      call(propositions) {
        console.log('Proposition update received:', propositions);
        if (propositions) {
          const updatedOffers = propositions.get(decisionScope)?.items.map(item => {
            const characteristics = item.data.characteristics || {};
            let parsedContent;
            try {
              parsedContent = JSON.parse(item.data.content);
              console.log('Parsed Content:', parsedContent); // Log parsed content
            } catch (e) {
              console.error('Error parsing content:', e);
              parsedContent = {};
            }
            return {
              title: parsedContent.name || parsedContent.title || 'No Title',
              text: parsedContent.text || 'No Text',
              image: parsedContent.image || '',
              price: parsedContent.price || 0,
              name: parsedContent.name || 'Unnamed Offer',
              category: parsedContent.category || 'defaultCategory',
              sku: parsedContent.sku || 'defaultSku',
            };
          }) || [];
          setOffers(updatedOffers);
          console.log('Updated offers:', updatedOffers);
        }
      },
    });

    // Load profile and decision scope
    const loadProfileAndScope = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
        const storedScope = await AsyncStorage.getItem(DECISION_SCOPE_KEY);
        if (storedScope) {
          setDecisionScope(storedScope);
          console.log('Decision scope loaded from AsyncStorage:', storedScope);
        } else {
          console.error('No decision scope found in AsyncStorage');
        }
      } catch (error) {
        console.error('Failed to load data from storage:', error);
      }
    };

    loadProfileAndScope();
  }, []);

  // Call getPropositions when decisionScope is set
  useEffect(() => {
    if (decisionScope) {
      console.log('Decision scope is set, calling getPropositions');
      getPropositions();
    }
  }, [decisionScope]);

  const getPropositions = async () => {
    console.log('Get Propositions called');
    if (!decisionScope) {
      console.error('Error: No decision scope found in AsyncStorage');
      console.log('Available decision scope:', decisionScope);
      return;
    }
    
    console.log('Using decision scope from AsyncStorage:', decisionScope);
    const userScope = new DecisionScope(decisionScope);
    console.log('Created DecisionScope with name:', userScope.getName());

    // Log the ECID or full identity map
    console.log('Fetching identity map...');
    try {
      const identityMap = await Identity.getIdentities();
      console.log('Identity Map:', identityMap);
    } catch (error) {
      console.error('Error fetching identity map:', error);
    }

    let ecid;
    // Use getExperienceCloudId to retrieve the ECID
    console.log('Fetching ECID...');
    try {
      ecid = await Identity.getExperienceCloudId();
      if (!ecid) {
        console.error('ECID not found');
        return;
      }
      console.log('ECID found:', ecid);
    } catch (error) {
      console.error('Error fetching ECID:', error);
    }

    const xdmData = { "xdm": { "identityMap": { "ECID": { "id": ecid, "primary": true } } } };

    // Adjust the getPropositions call
    console.log('Fetching propositions from cache...');
    try {
      const propositions: Map<string, Proposition> =
        await Optimize.getPropositions([userScope]);
      console.log('Propositions response received:', propositions);
      
      if (propositions && propositions.size > 0) {
        const scopeName = userScope.getName();
        const proposition = propositions.get(scopeName);
        
        if (proposition && proposition.items && proposition.items.length > 0) {
          console.log('Found proposition with items:', proposition.items.length);
          const mappedOffers = proposition.items.map(item => {
            const characteristics = item.data.characteristics || {};
            let parsedContent;
            try {
              parsedContent = JSON.parse(item.data.content);
              console.log('Parsed Content:', parsedContent); // Log parsed content
            } catch (e) {
              console.error('Error parsing content:', e);
              parsedContent = {};
            }
            return {
              title: parsedContent.name || parsedContent.title || 'No Title',
              text: parsedContent.text || 'No Text',
              image: parsedContent.image || '',
              price: parsedContent.price || 0,
              name: parsedContent.name || 'Unnamed Offer',
              category: parsedContent.category || 'defaultCategory',
              sku: parsedContent.sku || 'defaultSku',
            };
          });
          setOffers(mappedOffers);
          console.log('Mapped offers:', mappedOffers);
        } else {
          console.log('No items found in proposition');
          setOffers([]);
        }
      } else {
        console.log('No propositions found in cache');
        console.log('Available scopes in cache:', Array.from(propositions.keys()));
        setOffers([]);
      }
    } catch (error) {
      console.error('Error fetching propositions:', error);
      setOffers([]);
    }
  };

  const updateAndLogIdentity = async () => {
    try {
      const identityMap = new IdentityMap();
      if (profile.email) {
        identityMap.addItem({ id: profile.email, authenticatedState: AuthenticatedState.AUTHENTICATED, primary: true }, 'Email');
      }
      await Identity.updateIdentities(identityMap);
      console.log('Updated identity map:', identityMap);
    } catch (error) {
      console.error('Error updating identity map:', error);
    }
  };

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="gift" size={48} color="#007AFF" />
      <ThemedText style={{ fontSize: 24, marginTop: 12 }}>Offers View</ThemedText>
      <FlatList
        data={offers}
        renderItem={({ item }) => <OfferCard offer={item} styles={styles} colors={colors} addToCart={addToCart} />}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}
