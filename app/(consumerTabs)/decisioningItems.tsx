/**
 * Decisioning Items Consumer Tab
 * 
 * This component displays Code-Based Experiences from Adobe Journey Optimizer.
 * It uses the Adobe Messaging SDK to fetch and display personalized content based on
 * the surface configuration set in the DecisioningItemsView technical screen.
 * 
 * Key features:
 * - Fetches CBE content using configured surface via Messaging.updatePropositionsForSurfaces
 * - Displays personalized offers and experiences
 * - Handles proposition updates and tracking with built-in methods
 * - Integrates with AJO campaigns
 * 
 * Author: AI Assistant for Decisioning Items implementation
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Image, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileCore, LogLevel } from '@adobe/react-native-aepcore';
import { Messaging, MessagingEdgeEventType } from '@adobe/react-native-aepmessaging';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

// Storage key for Decisioning Items configuration
const DECISIONING_ITEMS_CONFIG_KEY = '@decisioning_items_config';
const LEGACY_EDGE_OFFERS_CONFIG_KEY = '@edge_offers_config'; // For migration from old key

interface DecisioningItemsConfig {
  surface: string;
  previewUrl: string;
  activityId?: string;
  description?: string;
}

interface DecisioningItem {
  id: string;
  itemID?: string;
  content: any;
  format?: string;
  proposition: any;
  propositionItem: any;
  surface: string;
  trackingToken?: string;
  isEmbeddedItem?: boolean;
}

export default function DecisioningItemsTab() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Component state
  const [config, setConfig] = useState<DecisioningItemsConfig | null>(null);
  const [items, setItems] = useState<DecisioningItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load configuration and fetch items when tab becomes focused
  useFocusEffect(
    useCallback(() => {
      console.log('🔵 DecisioningItems: Tab focused - loading configuration and items');
      loadConfigAndFetchItems();
      
      // Track tab view
      MobileCore.trackState('DecisioningItemsTab', {
        'view.name': 'Decisioning Items',
        'application.name': 'WeRetailMobileApp',
        'timestamp': new Date().toISOString(),
      });
    }, [])
  );

  const loadConfigAndFetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load saved configuration
      let savedConfig = await AsyncStorage.getItem(DECISIONING_ITEMS_CONFIG_KEY);
      
      // If no new config found, check for legacy Edge Offers config and migrate
      if (!savedConfig) {
        console.log('🔵 DecisioningItems: No config found, checking for legacy Edge Offers config...');
        const legacyConfig = await AsyncStorage.getItem(LEGACY_EDGE_OFFERS_CONFIG_KEY);
        
        if (legacyConfig) {
          console.log('🔵 DecisioningItems: Found legacy config, migrating...');
          // Migrate the config
          await AsyncStorage.setItem(DECISIONING_ITEMS_CONFIG_KEY, legacyConfig);
          // Optionally remove the old config
          await AsyncStorage.removeItem(LEGACY_EDGE_OFFERS_CONFIG_KEY);
          savedConfig = legacyConfig;
          console.log('🔵 DecisioningItems: ✅ Successfully migrated legacy config');
        }
      }
      
      if (!savedConfig) {
        setError('No Decisioning Items configuration found. Please configure in Technical View → Decisioning Items');
        setIsLoading(false);
        return;
      }

      const parsedConfig = JSON.parse(savedConfig);
      console.log('🔵 DecisioningItems: Loaded config:', parsedConfig);
      console.log('🟡 SURFACE DEBUG - Raw config surface:', parsedConfig.surface);
      console.log('🟡 SURFACE DEBUG - Surface type:', typeof parsedConfig.surface);
      console.log('🟡 SURFACE DEBUG - Surface length:', parsedConfig.surface?.length);
      setConfig(parsedConfig);

      // Validate required fields
      if (!parsedConfig.surface) {
        setError('Invalid configuration: Surface/Location is required');
        setIsLoading(false);
        return;
      }

      // Fetch items for the configured surface
      await fetchDecisioningItems(parsedConfig);
    } catch (error) {
      console.error('🔴 DecisioningItems: Error loading config or fetching items:', error);
      setError('Failed to load configuration or fetch items');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDecisioningItems = async (configuration: DecisioningItemsConfig) => {
    try {
      console.log('🔵 DecisioningItems: Starting fetchDecisioningItems with surface:', configuration.surface);

      // Use surface exactly as configured
      const surface = configuration.surface;
      console.log('🔵 DecisioningItems: Using surface:', surface);
      console.log('🟡 SURFACE DEBUG - About to call Messaging SDK with surface:', surface);
      console.log('🟡 SURFACE DEBUG - Surface array to be passed:', [surface]);
      console.log('🟡 SURFACE DEBUG - JSON.stringify surface array:', JSON.stringify([surface]));

      // Fetch propositions from server and cache
      console.log('🔵 DecisioningItems: Calling updatePropositionsForSurfaces...');
      await Messaging.updatePropositionsForSurfaces([surface]);

      // Retrieve cached propositions
      console.log('🔵 DecisioningItems: Retrieving cached propositions...');
      const propositionsResult = await Messaging.getPropositionsForSurfaces([surface]);
      
      console.log('🟡 SURFACE DEBUG - Raw propositions result:', propositionsResult);
      console.log('🟡 SURFACE DEBUG - Propositions result type:', typeof propositionsResult);
      
      // Convert propositions result to array if needed
      let propositionsArray: any[] = [];
      if (Array.isArray(propositionsResult)) {
        propositionsArray = propositionsResult;
      } else if (propositionsResult && typeof propositionsResult === 'object') {
        // Handle case where result is a dictionary/record
        console.log('🟡 SURFACE DEBUG - Propositions object keys:', Object.keys(propositionsResult));
        propositionsArray = Object.values(propositionsResult).flat();
      }
      
      console.log('🔵 DecisioningItems: Processed propositions:', propositionsArray.length);
      console.log('🟡 SURFACE DEBUG - Final propositions array:', propositionsArray);

      // Process propositions into items
      const extractedItems = processPropositions(propositionsArray);
      console.log('🔵 DecisioningItems: Extracted items count:', extractedItems.length);

      setItems(extractedItems);
      setLastUpdated(new Date());
      
      console.log('🔵 DecisioningItems: ✅ Successfully updated items');
      
    } catch (error: any) {
      console.error('🔴 DecisioningItems: Error fetching items:', error);
      
      // Handle specific error types
      if (error?.message?.includes('surface')) {
        setError('Invalid surface configuration');
      } else if (error?.message?.includes('network')) {
        setError('Network error - check connection');
      } else {
        setError('Failed to fetch items');
      }
      
      setItems([]);
      throw error;
    }
  };

  // Process propositions into items
  const processPropositions = (propositions: any[]): DecisioningItem[] => {
    console.log('🔵 DecisioningItems: Processing propositions:', propositions.length);
    const items: DecisioningItem[] = [];
    
    propositions.forEach((proposition, index) => {
      console.log(`🔵 DecisioningItems: Processing proposition ${index}:`, proposition.id);
      
      proposition.items.forEach((item: any, itemIndex: number) => {
        console.log(`🔵 DecisioningItems: Processing item ${itemIndex}:`, item.id);
        
        const content = item.data?.content || item.data;
        console.log('🟡 UNPACK DEBUG: Raw item.data:', item.data);
        console.log('🟡 UNPACK DEBUG: Item content:', content);
        console.log('🟡 UNPACK DEBUG: Content type:', typeof content);
        console.log('🟡 UNPACK DEBUG: Content keys:', content ? Object.keys(content) : 'null');
        
        // If content is a string, try to parse it
        let parsedContent = content;
        if (typeof content === 'string') {
          try {
            parsedContent = JSON.parse(content);
            console.log('🟡 UNPACK DEBUG: Parsed string content:', parsedContent);
            console.log('🟡 UNPACK DEBUG: Parsed content keys:', Object.keys(parsedContent || {}));
          } catch (e) {
            console.log('🟡 UNPACK DEBUG: Failed to parse string content as JSON');
            parsedContent = content;
          }
        }
        
        // Check if this JSON content contains an isJsonContent array that we need to unpack
        if (item.schema === 'https://ns.adobe.com/personalization/json-content-item') {
          // Check multiple possible locations for the isJsonContent array
          let isJsonContentArray = null;
          
          // Check direct access
          if (parsedContent && Array.isArray(parsedContent.isJsonContent)) {
            console.log('🟡 UNPACK DEBUG: Found isJsonContent at parsedContent.isJsonContent');
            isJsonContentArray = parsedContent.isJsonContent;
          }
          // Check if parsedContent itself is the array
          else if (Array.isArray(parsedContent)) {
            console.log('🟡 UNPACK DEBUG: parsedContent itself is an array - checking if it contains offers');
            console.log('🟡 UNPACK DEBUG: First array item:', parsedContent[0]);
            isJsonContentArray = parsedContent;
          }
          
          if (isJsonContentArray && isJsonContentArray.length > 0) {
            console.log('🟡 UNPACK DEBUG: Found isJsonContent array with', isJsonContentArray.length, 'offers - unpacking them');
            console.log('🟡 UNPACK DEBUG: Parent proposition item methods:', Object.keys(item || {}));
            console.log('🟡 UNPACK DEBUG: Parent proposition item has track?', typeof item?.track === 'function');
            console.log('🟡 UNPACK DEBUG: Proposition structure:', {
              id: proposition.id,
              scope: proposition.scope,
              items: proposition.items ? proposition.items.length : 'No items',
              propositionMethods: Object.keys(proposition || {}),
              hasTrackMethod: typeof proposition?.track === 'function'
            });
            
            // Debug proposition.items structure to find tracking methods
            if (proposition.items && Array.isArray(proposition.items)) {
              proposition.items.forEach((pItem: any, pIndex: number) => {
                console.log(`🟡 UNPACK DEBUG: Proposition item ${pIndex} methods:`, Object.keys(pItem || {}));
                console.log(`🟡 UNPACK DEBUG: Proposition item ${pIndex} has track?`, typeof pItem?.track === 'function');
              });
            }
            
            // CRITICAL: For embedded items (isJsonContent array), Adobe's tutorial requires:
            // 1. Track through the PARENT PropositionItem that contains the embedded array
            // 2. Pass individual tracking tokens to identify which embedded item was displayed/clicked
            // 3. Do NOT look for individual track methods on embedded items - they don't have them
            isJsonContentArray.forEach((offer: any, offerIndex: number) => {
              // Use the actual item ID from Adobe instead of creating derived ones
              const itemId = offer.id || offer.itemID || `fallback_${Date.now()}_${offerIndex}`;
              const trackingToken = offer['data-item-token'] || offer.trackingToken;
              
              console.log('🟡 UNPACK DEBUG: Creating separate item for offer:', offerIndex);
              console.log('🟡 UNPACK DEBUG: Using item ID:', itemId);
              console.log('🟡 UNPACK DEBUG: Tracking token:', trackingToken);
              console.log('🟡 UNPACK DEBUG: Will use parent item for tracking:', !!item?.track);
              
              items.push({
                id: itemId,
                itemID: offer.itemID,
                content: offer, // Store the individual offer as content
                format: 'application/json',
                proposition: proposition,
                propositionItem: item, // PARENT PropositionItem that contains the track() method
                surface: proposition.scope,
                trackingToken: trackingToken,
                isEmbeddedItem: true // Flag: this offer came from isJsonContent array, track via parent
              });
            });
          } else {
            // Regular JSON content without isJsonContent array
            console.log('🟡 UNPACK DEBUG: No isJsonContent array found, treating as single item');
            console.log('🟡 UNPACK DEBUG: Original item methods:', Object.keys(item || {}));
            console.log('🟡 UNPACK DEBUG: Item has track method?', typeof item?.track === 'function');
            console.log('🟡 UNPACK DEBUG: Proposition methods:', Object.keys(proposition || {}));
            console.log('🟡 UNPACK DEBUG: Proposition has track method?', typeof proposition?.track === 'function');
            items.push({
              id: item.id || `json_${Date.now()}_${itemIndex}`,
              content: parsedContent,
              format: 'application/json',
              proposition: proposition,
              propositionItem: item,
              surface: proposition.scope
            });
          }
        }
        // Handle HTML content
        else if (item.schema === 'https://ns.adobe.com/personalization/html-content-item') {
          items.push({
            id: item.id || `html_${Date.now()}_${itemIndex}`,
            content: parsedContent,
            format: 'text/html',
            proposition: proposition,
            propositionItem: item,
            surface: proposition.scope
          });
        }
        // Handle other content types
        else {
          console.log('🔵 DecisioningItems: Unknown schema, processing as generic:', item.schema);
          items.push({
            id: item.id || `generic_${Date.now()}_${itemIndex}`,
            content: parsedContent,
            format: 'unknown',
            proposition: proposition,
            propositionItem: item,
            surface: proposition.scope
          });
        }
      });
    });
    
    console.log('🔵 DecisioningItems: Total processed items after unpacking:', items.length);
    return items;
  };

  // Track item display - Following Adobe's official tutorial for embedded decisions
  const trackItemDisplay = (item: DecisioningItem) => {
    try {
      console.log('🔵 DecisioningItems: Tracking display for item:', item.id);
      console.log('🔵 DecisioningItems: Is embedded item:', item.isEmbeddedItem);
      console.log('🔵 DecisioningItems: Using tracking token:', item.trackingToken);
      
      // According to Adobe's tutorial for embedded decisions:
      // "Since the embedded items are located inside a single PropositionItem data, 
      // the app developer will need to extract the data-item-token when tracking"
      // https://developer.adobe.com/client-sdks/edge/adobe-journey-optimizer/code-based/tutorial/
      
      if (item.propositionItem && typeof item.propositionItem.track === 'function') {
        console.log('🔵 DecisioningItems: Using parent PropositionItem for tracking (Adobe best practice)');
        
        if (item.trackingToken && item.isEmbeddedItem) {
          // For embedded items, track with token using the parent PropositionItem
          console.log('🔵 DecisioningItems: Tracking embedded item with token:', item.trackingToken);
          item.propositionItem.track(null, MessagingEdgeEventType.DISPLAY, [item.trackingToken]);
        } else {
          // For regular items or when no token available
          console.log('🔵 DecisioningItems: Tracking regular item without token');
          item.propositionItem.track(null, MessagingEdgeEventType.DISPLAY);
        }
        console.log('🔵 DecisioningItems: ✅ Display tracking completed successfully');
      } else {
        console.log('🔴 DecisioningItems: PropositionItem.track() method not available');
        console.log('🔴 DecisioningItems: PropositionItem methods:', Object.keys(item.propositionItem || {}));
        console.log('🔴 DecisioningItems: This suggests an SDK version or setup issue');
      }
    } catch (error) {
      console.error('🔴 DecisioningItems: Error tracking display:', error);
    }
  };

  // Track item interaction - Following Adobe's official tutorial for embedded decisions
  const trackItemInteraction = (item: DecisioningItem, interaction: string) => {
    try {
      console.log('🔵 DecisioningItems: Tracking interaction:', interaction, 'for item:', item.id);
      console.log('🔵 DecisioningItems: Is embedded item:', item.isEmbeddedItem);
      console.log('🔵 DecisioningItems: Using tracking token:', item.trackingToken);
      
      // According to Adobe's tutorial for embedded decisions:
      // Track interactions through the parent PropositionItem with tokens
      // https://developer.adobe.com/client-sdks/edge/adobe-journey-optimizer/code-based/tutorial/
      
      if (item.propositionItem && typeof item.propositionItem.track === 'function') {
        console.log('🔵 DecisioningItems: Using parent PropositionItem for interaction tracking (Adobe best practice)');
        
        if (item.trackingToken && item.isEmbeddedItem) {
          // For embedded items, track with token using the parent PropositionItem
          console.log('🔵 DecisioningItems: Tracking embedded item interaction with token:', item.trackingToken);
          item.propositionItem.track(interaction, MessagingEdgeEventType.INTERACT, [item.trackingToken]);
        } else {
          // For regular items or when no token available
          console.log('🔵 DecisioningItems: Tracking regular item interaction without token');
          item.propositionItem.track(interaction, MessagingEdgeEventType.INTERACT);
        }
        console.log('🔵 DecisioningItems: ✅ Interaction tracking completed successfully');
      } 
    } catch (error) {
      console.error('🔴 DecisioningItems: Error tracking interaction:', error);
    }
  };

  const handleItemClick = (item: DecisioningItem) => {
    console.log('🔵 DecisioningItems: Item clicked:', item.id);
    
    // Track the interaction using Adobe's recommended "click" interaction
    trackItemInteraction(item, 'click');
    
    const content = parseItemContent(item);
    
    // Track item interaction with enhanced data (now handles individual offers with Adobe IDs)
    MobileCore.trackAction('offer.clicked', {
      'item.id': item.id,
      'item.itemID': item.itemID || 'Not set',
      'item.trackingToken': item.trackingToken || 'Not set',
      'item.surface': item.surface || config?.surface,
      'offer.name': content.title || 'Unknown',
      'offer.price': content.price || 'Not set',
      'offer.classification': content.badge || 'Not set',
      'offer.tone': content.tone || 'Not set',
      'application.name': 'WeRetailMobileApp'
    });

    // Handle CTA action based on parsed content
    if (content.ctaUrl) {
      Alert.alert(
        content.title || 'Item Action',
        `${content.description ? content.description + '\n\n' : ''}Navigate to: ${content.ctaUrl}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: content.ctaText || 'Go', 
            style: 'default',
            onPress: () => {
              console.log('🔵 DecisioningItems: User confirmed CTA navigation to:', content.ctaUrl);
              // Handle URL navigation
              if (content.ctaUrl.startsWith('http')) {
                Linking.openURL(content.ctaUrl).catch(err => {
                  console.error('🔴 DecisioningItems: Error opening URL:', err);
                  Alert.alert('Error', 'Unable to open URL');
                });
              } else {
                // For deep links or other navigation schemes
                console.log('🔵 DecisioningItems: Deep link or custom navigation:', content.ctaUrl);
                // You can handle deep links or router navigation here
                Alert.alert('Navigation', `Deep link: ${content.ctaUrl}`);
              }
            }
          }
        ]
      );
    } else {
      // Show offer details including Adobe IDs
      const details = [
        content.title && `Title: ${content.title}`,
        content.subtitle && `Subtitle: ${content.subtitle}`,
        content.description && `Description: ${content.description}`,
        content.price && `Price: $${content.price}`,
        content.discount && `Discount: ${content.discount}`,
        content.badge && `Classification: ${content.badge}`,
        content.tone && `Tone: ${content.tone}`,
        `Item ID: ${item.id}`,
        item.itemID && `Adobe Item ID: ${item.itemID}`,
        item.trackingToken && `Tracking Token: ${item.trackingToken.substring(0, 30)}...`,
        `Surface: ${item.surface || config?.surface || 'Unknown'}`,
        `Format: ${item.format || 'Unknown'}`
      ].filter(Boolean).join('\n');

      Alert.alert(
        content.title || 'Offer Details',
        details || 'No additional details available',
        [
          { text: 'View Raw JSON', onPress: () => {
            Alert.alert('Raw Offer JSON', JSON.stringify(content.raw, null, 2));
          }},
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  // Enhanced JSON parsing to extract common AJO campaign content
  const parseItemContent = (item: DecisioningItem) => {
    let parsedContent = item.content;
    
    // If content is a string, try to parse it as JSON
    if (typeof item.content === 'string') {
      try {
        parsedContent = JSON.parse(item.content);
        console.log('🔵 DecisioningItems: Parsed string content as JSON:', parsedContent);
      } catch (e) {
        console.log('🔵 DecisioningItems: Content is not valid JSON string, using as-is');
        parsedContent = { text: item.content };
      }
    }

    // Extract common fields from various possible JSON structures
    const extractValue = (obj: any, keys: string[]) => {
      for (const key of keys) {
        if (obj && typeof obj === 'object' && obj[key]) {
          return obj[key];
        }
      }
      return null;
    };

    return {
      // For individual offers, use the expected Adobe format field names
      title: extractValue(parsedContent, ['name', 'IVRmessage', 'title', 'headline', 'header', 'label']),
      subtitle: extractValue(parsedContent, ['subtitle', 'subheader', 'subheading', 'tagline']),
      description: extractValue(parsedContent, ['description', 'body', 'text', 'content', 'message']),
      image: extractValue(parsedContent, ['image', 'imageUrl', 'img', 'picture', 'photo']),
      ctaText: extractValue(parsedContent, ['ctaText', 'buttonText', 'linkText', 'actionText', 'cta']),
      ctaUrl: extractValue(parsedContent, ['ctaUrl', 'buttonUrl', 'linkUrl', 'actionUrl', 'url', 'link']),
      price: extractValue(parsedContent, ['price', 'cost', 'amount', 'value']),
      discount: extractValue(parsedContent, ['discount', 'savings', 'offer', 'deal']),
      badge: extractValue(parsedContent, ['classification', 'badge', 'tag', 'label', 'category']),
      priority: extractValue(parsedContent, ['priority', 'importance', 'weight']),
      tone: extractValue(parsedContent, ['IVRtone', 'tone']),
      itemID: extractValue(parsedContent, ['itemID', 'id']),
      trackingToken: extractValue(parsedContent, ['data-item-token', 'trackingToken', '_trackingToken']),
      raw: parsedContent // Keep raw content for debugging
    };
  };

  const renderItem = (item: DecisioningItem, index: number) => {
    const content = parseItemContent(item);
    
    console.log('🔵 DecisioningItems: Rendering individual item:', {
      id: item.id,
      format: item.format,
      extractedContent: content
    });
    
    return (
      <TouchableOpacity
        key={item.id}
        style={{
          backgroundColor: tintColor + '15',
          padding: 16,
          marginVertical: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: tintColor + '30',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}
        onPress={() => handleItemClick(item)}
        onLayout={() => trackItemDisplay(item)}
      >
        {/* Header Section */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <ThemedText style={{ fontWeight: 'bold', fontSize: 18, flex: 1, marginRight: 8 }}>
              {content.title || `Offer ${index + 1}`}
            </ThemedText>
          </View>

          {content.subtitle && (
            <ThemedText style={{ fontSize: 14, fontWeight: '600', opacity: 0.9, marginBottom: 4 }}>
              {content.subtitle}
            </ThemedText>
          )}

          {/* Price and Classification Section */}
          {(content.price || content.badge) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              {content.price && (
                <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: tintColor }}>
                  ${content.price}
                </ThemedText>
              )}
              {content.badge && (
                <View style={{
                  backgroundColor: tintColor,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12
                }}>
                  <ThemedText style={{ color: backgroundColor, fontSize: 10, fontWeight: 'bold' }}>
                    {content.badge}
                  </ThemedText>
                </View>
              )}
            </View>
          )}
          
          {content.discount && (
            <View style={{ backgroundColor: '#ff4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' }}>
              <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                {content.discount}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Description */}
        {content.description && (
          <ThemedText style={{ 
            marginBottom: 12, 
            opacity: 0.8, 
            lineHeight: 20,
            fontSize: 14 
          }}>
            {content.description}
          </ThemedText>
        )}

        {/* Image */}
        {content.image && (
          <View style={{ marginBottom: 12, alignItems: 'center' }}>
            {content.image.startsWith('http') ? (
              <Image
                source={{ uri: content.image }}
                style={{
                  width: '100%',
                  height: 140,
                  borderRadius: 8,
                  marginBottom: 4
                }}
                resizeMode="contain"
                onError={() => console.log('🔴 DecisioningItems: Failed to load image:', content.image)}
              />
            ) : (
              <View style={{
                width: '100%',
                height: 80,
                backgroundColor: tintColor + '10',
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4
              }}>
                <ThemedText style={{ fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
                  🖼️ {content.image}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Footer Section */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: tintColor + '20'
        }}>
          <View>
            <ThemedText style={{ fontSize: 11, opacity: 0.6 }}>
              Item ID: {item.id}
            </ThemedText>
            {item.trackingToken && (
              <ThemedText style={{ fontSize: 11, opacity: 0.6 }}>
                Tracking Token: {item.trackingToken.substring(0, 20)}...
              </ThemedText>
            )}
            {content.tone && (
              <ThemedText style={{ fontSize: 11, opacity: 0.6 }}>
                Tone: {content.tone}
              </ThemedText>
            )}
            {content.priority && (
              <ThemedText style={{ fontSize: 11, opacity: 0.6 }}>
                Priority: {content.priority}
              </ThemedText>
            )}
          </View>
          
          {content.ctaText && (
            <View style={{
              backgroundColor: tintColor,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2
            }}>
              <ThemedText style={{ color: backgroundColor, fontSize: 14, fontWeight: 'bold' }}>
                {content.ctaText}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Offer Debug Info */}
        {item.format === 'application/json' && (
          <View style={{ 
            marginTop: 8,
            padding: 8,
            backgroundColor: tintColor + '05',
            borderRadius: 4,
            borderWidth: 1,
            borderColor: tintColor + '15'
          }}>
            <ThemedText style={{ fontSize: 10, opacity: 0.6 }}>
              Offer Keys: {Object.keys(content.raw || {}).slice(0, 5).join(', ')}
              {Object.keys(content.raw || {}).length > 5 ? '...' : ''}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderConfigError = () => (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <ThemedText style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
        ⚙️ Configuration Required
      </ThemedText>
      <ThemedText style={{ textAlign: 'center', opacity: 0.8, marginBottom: 20 }}>
        {error}
      </ThemedText>
      <ThemedText style={{ textAlign: 'center', fontSize: 12, opacity: 0.6 }}>
        Go to Technical View → Decisioning Items to configure surface and preview URL
      </ThemedText>
    </View>
  );

  const renderContent = () => {
    if (error) {
      return renderConfigError();
    }

    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={{ marginTop: 16, textAlign: 'center' }}>
            Fetching personalized items...
          </ThemedText>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ThemedText style={{ fontSize: 18, marginBottom: 10 }}>
            📭 No Items Available
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', opacity: 0.8 }}>
            No personalized items found for the configured surface.
          </ThemedText>
          {config && (
            <ThemedText style={{ textAlign: 'center', fontSize: 12, opacity: 0.6, marginTop: 10 }}>
              Surface: {config.surface}
            </ThemedText>
          )}
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {items.map(renderItem)}
      </View>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadConfigAndFetchItems}
            tintColor={tintColor}
          />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <ThemedText type="title" style={{ marginBottom: 5 }}>
            Decisioning Items
          </ThemedText>
          <ThemedText style={{ opacity: 0.7, fontSize: 14 }}>
            Personalized experiences from Adobe Journey Optimizer
          </ThemedText>
          {lastUpdated && (
            <ThemedText style={{ opacity: 0.5, fontSize: 12, marginTop: 5 }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </ThemedText>
          )}
        </View>

        {/* Configuration Info */}
        {config && !error && (
          <View style={{ 
            backgroundColor: tintColor + '10', 
            padding: 12, 
            borderRadius: 6, 
            marginBottom: 20,
            borderWidth: 1,
            borderColor: tintColor + '30'
          }}>
            <ThemedText style={{ fontWeight: 'bold', marginBottom: 5 }}>
              Configuration:
            </ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>
              Surface: {config.surface}
            </ThemedText>
            {config.activityId && (
              <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>
                Activity ID: {config.activityId}
              </ThemedText>
            )}
          </View>
        )}

        {/* Content */}
        {renderContent()}
      </ScrollView>
    </ThemedView>
  );
}
