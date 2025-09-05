/**
 * Edge Offers Consumer Tab
 * 
 * This component displays Code-Based Experiences from Adobe Journey Optimizer.
 * It uses the Adobe Messaging SDK to fetch and display personalized content based on
 * the surface configuration set in the EdgeOffersView technical screen.
 * 
 * Key features:
 * - Fetches CBE content using configured surface via Messaging.updatePropositionsForSurfaces
 * - Displays personalized offers and experiences
 * - Handles proposition updates and tracking with built-in methods
 * - Integrates with AJO campaigns
 * 
 * Author: AI Assistant for Edge Offers implementation
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

// Storage key for Edge Offers configuration
const EDGE_OFFERS_CONFIG_KEY = '@edge_offers_config';

interface EdgeOffersConfig {
  surface: string;
  previewUrl: string;
  activityId?: string;
  description?: string;
}

interface EdgeOffer {
  id: string;
  content: any;
  format?: string;
  proposition: any;
  propositionItem: any;
  surface: string;
}

export default function EdgeOffersTab() {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Component state
  const [config, setConfig] = useState<EdgeOffersConfig | null>(null);
  const [offers, setOffers] = useState<EdgeOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load configuration and fetch offers when tab becomes focused
  useFocusEffect(
    useCallback(() => {
      console.log('🔵 EdgeOffers: Tab focused - loading configuration and offers');
      loadConfigAndFetchOffers();
      
      // Track tab view
      MobileCore.trackState('EdgeOffersTab', {
        'view.name': 'Edge Offers',
        'application.name': 'WeRetailMobileApp',
        'timestamp': new Date().toISOString(),
      });
    }, [])
  );

  const loadConfigAndFetchOffers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load saved configuration
      const savedConfig = await AsyncStorage.getItem(EDGE_OFFERS_CONFIG_KEY);
      
      if (!savedConfig) {
        setError('No Edge Offers configuration found. Please configure in Technical View → Edge Offers');
        setIsLoading(false);
        return;
      }

      const parsedConfig = JSON.parse(savedConfig);
      console.log('🔵 EdgeOffers: Loaded config:', parsedConfig);
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

      // Fetch offers for the configured surface
      await fetchEdgeOffers(parsedConfig);
    } catch (error) {
      console.error('🔴 EdgeOffers: Error loading config or fetching offers:', error);
      setError('Failed to load configuration or fetch offers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEdgeOffers = async (configuration: EdgeOffersConfig) => {
    try {
      console.log('🔵 EdgeOffers: Starting fetchEdgeOffers with surface:', configuration.surface);

      // Use surface exactly as configured
      const surface = configuration.surface;
      console.log('🔵 EdgeOffers: Using surface:', surface);
      console.log('🟡 SURFACE DEBUG - About to call Messaging SDK with surface:', surface);
      console.log('🟡 SURFACE DEBUG - Surface array to be passed:', [surface]);
      console.log('🟡 SURFACE DEBUG - JSON.stringify surface array:', JSON.stringify([surface]));

      // Fetch propositions from server and cache
      console.log('🔵 EdgeOffers: Calling updatePropositionsForSurfaces...');
      await Messaging.updatePropositionsForSurfaces([surface]);

      // Retrieve cached propositions
      console.log('🔵 EdgeOffers: Retrieving cached propositions...');
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
      
      console.log('🔵 EdgeOffers: Processed propositions:', propositionsArray.length);
      console.log('🟡 SURFACE DEBUG - Final propositions array:', propositionsArray);

      // Process propositions into offers
      const extractedOffers = processPropositions(propositionsArray);
      console.log('🔵 EdgeOffers: Extracted offers count:', extractedOffers.length);

      setOffers(extractedOffers);
      setLastUpdated(new Date());
      
      console.log('🔵 EdgeOffers: ✅ Successfully updated offers');
      
    } catch (error: any) {
      console.error('🔴 EdgeOffers: Error fetching offers:', error);
      
      // Handle specific error types
      if (error?.message?.includes('surface')) {
        setError('Invalid surface configuration');
      } else if (error?.message?.includes('network')) {
        setError('Network error - check connection');
      } else {
        setError('Failed to fetch offers');
      }
      
      setOffers([]);
      throw error;
    }
  };

  // Process propositions into offers
  const processPropositions = (propositions: any[]): EdgeOffer[] => {
    console.log('🔵 EdgeOffers: Processing propositions:', propositions.length);
    const offers: EdgeOffer[] = [];
    
    propositions.forEach((proposition, index) => {
      console.log(`🔵 EdgeOffers: Processing proposition ${index}:`, proposition.id);
      
      proposition.items.forEach((item: any, itemIndex: number) => {
        console.log(`🔵 EdgeOffers: Processing item ${itemIndex}:`, item.id);
        
        // Handle JSON content
        if (item.schema === 'https://ns.adobe.com/personalization/json-content-item') {
          offers.push({
            id: item.id || `json_${Date.now()}_${itemIndex}`,
            content: item.data?.content || item.data,
            format: 'application/json',
            proposition: proposition,
            propositionItem: item,
            surface: proposition.scope
          });
        }
        // Handle HTML content
        else if (item.schema === 'https://ns.adobe.com/personalization/html-content-item') {
          offers.push({
            id: item.id || `html_${Date.now()}_${itemIndex}`,
            content: item.data?.content || item.data,
            format: 'text/html',
            proposition: proposition,
            propositionItem: item,
            surface: proposition.scope
          });
        }
        // Handle other content types
        else {
          console.log('🔵 EdgeOffers: Unknown schema, processing as generic:', item.schema);
          offers.push({
            id: item.id || `generic_${Date.now()}_${itemIndex}`,
            content: item.data?.content || item.data,
            format: 'unknown',
            proposition: proposition,
            propositionItem: item,
            surface: proposition.scope
          });
        }
      });
    });
    
    return offers;
  };

  // Track offer display
  const trackOfferDisplay = (offer: EdgeOffer) => {
    try {
      console.log('🔵 EdgeOffers: Tracking display for offer:', offer.id);
      offer.propositionItem.track(null, MessagingEdgeEventType.DISPLAY);
    } catch (error) {
      console.error('🔴 EdgeOffers: Error tracking display:', error);
    }
  };

  // Track offer interaction
  const trackOfferInteraction = (offer: EdgeOffer, interaction: string) => {
    try {
      console.log('🔵 EdgeOffers: Tracking interaction:', interaction, 'for offer:', offer.id);
      offer.propositionItem.track(interaction, MessagingEdgeEventType.INTERACT);
    } catch (error) {
      console.error('🔴 EdgeOffers: Error tracking interaction:', error);
    }
  };

  const handleOfferClick = (offer: EdgeOffer) => {
    console.log('🔵 EdgeOffers: Offer clicked:', offer.id);
    
    // Track the interaction
    trackOfferInteraction(offer, 'click');
    
    const content = parseOfferContent(offer);
    
    // Track offer interaction with enhanced data
    MobileCore.trackAction('offer.clicked', {
      'offer.id': offer.id,
      'offer.surface': offer.surface || config?.surface,
      'offer.title': content.title || 'Unknown',
      'offer.hasCtaUrl': !!content.ctaUrl,
      'application.name': 'WeRetailMobileApp'
    });

    // Handle CTA action based on parsed content
    if (content.ctaUrl) {
      Alert.alert(
        content.title || 'Offer Action',
        `${content.description ? content.description + '\n\n' : ''}Navigate to: ${content.ctaUrl}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: content.ctaText || 'Go', 
            style: 'default',
            onPress: () => {
              console.log('🔵 EdgeOffers: User confirmed CTA navigation to:', content.ctaUrl);
              // Handle URL navigation
              if (content.ctaUrl.startsWith('http')) {
                Linking.openURL(content.ctaUrl).catch(err => {
                  console.error('🔴 EdgeOffers: Error opening URL:', err);
                  Alert.alert('Error', 'Unable to open URL');
                });
              } else {
                // For deep links or other navigation schemes
                console.log('🔵 EdgeOffers: Deep link or custom navigation:', content.ctaUrl);
                // You can handle deep links or router navigation here
                Alert.alert('Navigation', `Deep link: ${content.ctaUrl}`);
              }
            }
          }
        ]
      );
    } else {
      // Show offer details in a more user-friendly way
      const details = [
        content.title && `Title: ${content.title}`,
        content.subtitle && `Subtitle: ${content.subtitle}`,
        content.description && `Description: ${content.description}`,
        content.price && `Price: ${content.price}`,
        content.discount && `Discount: ${content.discount}`,
        content.badge && `Badge: ${content.badge}`,
        `Surface: ${offer.surface || config?.surface || 'Unknown'}`,
        `Format: ${offer.format || 'Unknown'}`
      ].filter(Boolean).join('\n');

      Alert.alert(
        'Offer Details',
        details || 'No additional details available',
        [
          { text: 'View Raw JSON', onPress: () => {
            Alert.alert('Raw JSON Content', JSON.stringify(content.raw, null, 2));
          }},
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  // Enhanced JSON parsing to extract common AJO campaign content
  const parseOfferContent = (offer: EdgeOffer) => {
    let parsedContent = offer.content;
    
    // If content is a string, try to parse it as JSON
    if (typeof offer.content === 'string') {
      try {
        parsedContent = JSON.parse(offer.content);
        console.log('🔵 EdgeOffers: Parsed string content as JSON:', parsedContent);
      } catch (e) {
        console.log('🔵 EdgeOffers: Content is not valid JSON string, using as-is');
        parsedContent = { text: offer.content };
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
      title: extractValue(parsedContent, ['title', 'headline', 'header', 'name', 'label']),
      subtitle: extractValue(parsedContent, ['subtitle', 'subheader', 'subheading', 'tagline']),
      description: extractValue(parsedContent, ['description', 'body', 'text', 'content', 'message']),
      image: extractValue(parsedContent, ['image', 'imageUrl', 'img', 'picture', 'photo']),
      ctaText: extractValue(parsedContent, ['ctaText', 'buttonText', 'linkText', 'actionText', 'cta']),
      ctaUrl: extractValue(parsedContent, ['ctaUrl', 'buttonUrl', 'linkUrl', 'actionUrl', 'url', 'link']),
      price: extractValue(parsedContent, ['price', 'cost', 'amount', 'value']),
      discount: extractValue(parsedContent, ['discount', 'savings', 'offer', 'deal']),
      badge: extractValue(parsedContent, ['badge', 'tag', 'label', 'category']),
      priority: extractValue(parsedContent, ['priority', 'importance', 'weight']),
      raw: parsedContent // Keep raw content for debugging
    };
  };

  const renderOffer = (offer: EdgeOffer, index: number) => {
    const isJsonContent = (offer.format === 'application/json' || offer.format?.includes('json')) && offer.content;
    const content = parseOfferContent(offer);
    
    console.log('🔵 EdgeOffers: Rendering offer:', {
      id: offer.id,
      format: offer.format,
      isJsonContent,
      extractedContent: content
    });
    
    return (
      <TouchableOpacity
        key={offer.id}
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
        onPress={() => handleOfferClick(offer)}
        onLayout={() => trackOfferDisplay(offer)}
      >
        {/* Badge/Priority Indicator */}
        {content.badge && (
          <View style={{
            position: 'absolute',
            top: 12,
            right: 12,
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

        {/* Header Section */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <ThemedText style={{ fontWeight: 'bold', fontSize: 18, flex: 1, marginRight: 8 }}>
              {content.title || `Edge Offer ${index + 1}`}
            </ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.6, backgroundColor: tintColor + '10', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              {offer.format || 'Unknown'}
            </ThemedText>
          </View>

          {content.subtitle && (
            <ThemedText style={{ fontSize: 14, fontWeight: '600', opacity: 0.9, marginBottom: 4 }}>
              {content.subtitle}
            </ThemedText>
          )}

          {/* Price/Discount Section */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {content.price && (
              <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: tintColor }}>
                {content.price}
              </ThemedText>
            )}
            {content.discount && (
              <View style={{ backgroundColor: '#ff4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                  {content.discount}
                </ThemedText>
              </View>
            )}
          </View>
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
                  height: 120,
                  borderRadius: 8,
                  marginBottom: 4
                }}
                resizeMode="cover"
                onError={() => console.log('🔴 EdgeOffers: Failed to load image:', content.image)}
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
              Surface: {offer.surface || config?.surface || 'Unknown'}
            </ThemedText>
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

        {/* Raw JSON Debug (collapsed view) */}
        {!isJsonContent && offer.content && (
          <View style={{ 
            marginTop: 12, 
            padding: 10, 
            backgroundColor: backgroundColor, 
            borderRadius: 6,
            borderWidth: 1,
            borderColor: tintColor + '20'
          }}>
            <ThemedText style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4, opacity: 0.7 }}>
              Raw Content:
            </ThemedText>
            <ThemedText style={{ fontFamily: 'monospace', fontSize: 10, opacity: 0.8 }}>
              {typeof offer.content === 'string' ? offer.content : JSON.stringify(offer.content, null, 2)}
            </ThemedText>
          </View>
        )}

        {/* JSON Content Debug (show first few keys) */}
        {isJsonContent && (
          <View style={{ 
            marginTop: 8,
            padding: 8,
            backgroundColor: tintColor + '05',
            borderRadius: 4,
            borderWidth: 1,
            borderColor: tintColor + '15'
          }}>
            <ThemedText style={{ fontSize: 10, opacity: 0.6 }}>
              JSON Keys: {Object.keys(content.raw || {}).slice(0, 5).join(', ')}
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
        Go to Technical View → Edge Offers to configure surface and preview URL
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
            Fetching personalized offers...
          </ThemedText>
        </View>
      );
    }

    if (offers.length === 0) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ThemedText style={{ fontSize: 18, marginBottom: 10 }}>
            📭 No Offers Available
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', opacity: 0.8 }}>
            No personalized offers found for the configured surface.
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
        {offers.map(renderOffer)}
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
            onRefresh={loadConfigAndFetchOffers}
            tintColor={tintColor}
          />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <ThemedText type="title" style={{ marginBottom: 5 }}>
            Edge Offers
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
