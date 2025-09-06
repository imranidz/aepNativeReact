/**
 * Decisioning Items Configuration View
 * 
 * This screen allows configuration of Adobe Journey Optimizer Code-Based Experiences (CBE).
 * 
 * Required parameters for AJO CBE:
 * - App ID: Already configured in AppIdConfigView
 * - Surface/Location: Where content will be rendered in the app (e.g. 'hero-banner', 'product-rail')
 * - Preview URL: Deep link for on-device previews
 * - Campaign Activity ID: Optional, for specific campaign targeting
 * 
 * Author: AI Assistant for Decisioning Items implementation
 */

import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

// AsyncStorage keys for Decisioning Items configuration
const DECISIONING_ITEMS_CONFIG_KEY = '@decisioning_items_config';
const LEGACY_EDGE_OFFERS_CONFIG_KEY = '@edge_offers_config'; // For migration from old key

interface DecisioningItemsConfig {
  surface: string;
  previewUrl: string;
  activityId?: string;
  description?: string;
}

export default function DecisioningItemsView() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Configuration state
  const [config, setConfig] = useState<DecisioningItemsConfig>({
    surface: '',
    previewUrl: '',
    activityId: '',
    description: '',
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved configuration on component mount
  useEffect(() => {
    loadSavedConfig();
  }, []);

  const loadSavedConfig = async () => {
    try {
      // First, try to load the new config
      let savedConfig = await AsyncStorage.getItem(DECISIONING_ITEMS_CONFIG_KEY);
      console.log('🔵 Loading saved Decisioning Items config:', savedConfig);
      
      // If no new config found, check for legacy Edge Offers config and migrate
      if (!savedConfig) {
        console.log('🔵 No Decisioning Items config found, checking for legacy Edge Offers config...');
        const legacyConfig = await AsyncStorage.getItem(LEGACY_EDGE_OFFERS_CONFIG_KEY);
        
        if (legacyConfig) {
          console.log('🔵 Found legacy Edge Offers config, migrating to Decisioning Items...');
          // Migrate the config
          await AsyncStorage.setItem(DECISIONING_ITEMS_CONFIG_KEY, legacyConfig);
          // Optionally remove the old config
          await AsyncStorage.removeItem(LEGACY_EDGE_OFFERS_CONFIG_KEY);
          savedConfig = legacyConfig;
          console.log('🔵 ✅ Successfully migrated legacy config to Decisioning Items');
        }
      }
      
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        console.log('🔵 Loaded Decisioning Items config:', parsedConfig);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('🔴 Error loading Decisioning Items config:', error);
      setIsInitialized(true);
    }
  };

  const saveConfig = async () => {
    try {
      // Validate required fields
      if (!config.surface.trim()) {
        Alert.alert('Error', 'Surface/Location is required');
        return;
      }

      if (!config.previewUrl.trim()) {
        Alert.alert('Error', 'Preview URL is required');
        return;
      }

      // Basic URL validation
      if (!config.previewUrl.includes('://')) {
        Alert.alert('Error', 'Preview URL must be a valid deep link (e.g., myapp://decisioning-items)');
        return;
      }

      const configToSave = {
        ...config,
        surface: config.surface.trim(),
        previewUrl: config.previewUrl.trim(),
        activityId: config.activityId?.trim() || '',
        description: config.description?.trim() || '',
      };

      console.log('🔵 Saving Decisioning Items config:', configToSave);
      await AsyncStorage.setItem(DECISIONING_ITEMS_CONFIG_KEY, JSON.stringify(configToSave));
      
      Alert.alert('Success', 'Decisioning Items configuration saved successfully');
    } catch (error) {
      console.error('🔴 Error saving Decisioning Items config:', error);
      Alert.alert('Error', 'Failed to save Decisioning Items configuration');
    }
  };

  const validateConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem(DECISIONING_ITEMS_CONFIG_KEY);
      
      if (!savedConfig) {
        Alert.alert('Validation', 'No configuration found. Please save configuration first.');
        return;
      }

      const parsedConfig = JSON.parse(savedConfig);
      
      let validationMessage = '✅ Configuration Validation:\n\n';
      validationMessage += `Surface: ${parsedConfig.surface || 'Not set'}\n`;
      validationMessage += `Preview URL: ${parsedConfig.previewUrl || 'Not set'}\n`;
      validationMessage += `Activity ID: ${parsedConfig.activityId || 'Not set (optional)'}\n`;
      validationMessage += `Description: ${parsedConfig.description || 'Not set (optional)'}\n\n`;
      
      // Check if required fields are present
      const isValid = parsedConfig.surface && parsedConfig.previewUrl;
      validationMessage += isValid ? 'Status: ✅ Valid configuration' : 'Status: ❌ Missing required fields';
      
      Alert.alert('Configuration Status', validationMessage);
    } catch (error) {
      console.error('🔴 Error validating config:', error);
      Alert.alert('Error', 'Failed to validate configuration');
    }
  };

  const clearConfig = async () => {
    try {
      await AsyncStorage.removeItem(DECISIONING_ITEMS_CONFIG_KEY);
      setConfig({
        surface: '',
        previewUrl: '',
        activityId: '',
        description: '',
      });
      console.log('🔵 Cleared Decisioning Items configuration');
      Alert.alert('Cleared', 'Decisioning Items configuration cleared');
    } catch (error) {
      console.error('🔴 Error clearing config:', error);
      Alert.alert('Error', 'Failed to clear configuration');
    }
  };

  const updateField = (field: keyof DecisioningItemsConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isInitialized) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading configuration...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={{ fontSize: 16, color: tintColor }}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Decisioning Items</ThemedText>
        <View style={{ width: 50 }} />
      </View>

      <View style={{ marginVertical: 10, backgroundColor: tintColor + '10', padding: 15, borderRadius: 5 }}>
        <ThemedText style={{ fontWeight: 'bold', marginBottom: 5 }}>Adobe Journey Optimizer Code-Based Experience</ThemedText>
        <ThemedText style={{ fontSize: 12, marginBottom: 3 }}>Configure surface locations and preview settings for AJO campaigns</ThemedText>
        <ThemedText style={{ fontSize: 12, marginBottom: 3 }}>• Surface: Where content appears in your app (e.g., 'hero-banner')</ThemedText>
        <ThemedText style={{ fontSize: 12, marginBottom: 3 }}>• Preview URL: Deep link for campaign testing</ThemedText>
        <ThemedText style={{ fontSize: 12 }}>• Activity ID: Optional campaign-specific targeting</ThemedText>
      </View>

      <View style={{ marginVertical: 15 }}>
        <ThemedText style={{ marginBottom: 5, fontWeight: 'bold' }}>Surface/Location *</ThemedText>
        <ThemedText style={{ fontSize: 12, marginBottom: 5, opacity: 0.7 }}>
          Surface identifier for AJO campaigns. Simple names (e.g., 'decisioning-items') will be auto-converted to: @mobileapp://com.cmtBootCamp.AEPSampleAppNewArchEnabled/[surface-name]
        </ThemedText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: tintColor,
            padding: 12,
            marginBottom: 5,
            borderRadius: 5,
            color: textColor,
            backgroundColor: backgroundColor
          }}
          value={config.surface}
          onChangeText={(text) => updateField('surface', text)}
          placeholder="e.g., decisioning-items"
          placeholderTextColor={textColor + '80'}
        />
        
        {/* Show the final URI that will be sent to Adobe */}
        {config.surface && (
          <View style={{ 
            backgroundColor: tintColor + '10', 
            padding: 10, 
            borderRadius: 5, 
            marginBottom: 5,
            borderWidth: 1,
            borderColor: tintColor + '20'
          }}>
            <ThemedText style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 3 }}>
              Final surface URI sent to Adobe:
            </ThemedText>
            <ThemedText style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.8 }}>
              {config.surface.includes('://') 
                ? config.surface 
                : `@mobileapp://com.cmtBootCamp.AEPSampleAppNewArchEnabled/${config.surface}`}
            </ThemedText>
            
            {/* Button to convert to full URI format */}
            {config.surface && !config.surface.includes('://') && (
              <TouchableOpacity
                style={{
                  backgroundColor: tintColor + '30',
                  padding: 6,
                  borderRadius: 3,
                  marginTop: 5,
                  alignSelf: 'flex-start'
                }}
                onPress={() => {
                  const fullUri = `@mobileapp://com.cmtBootCamp.AEPSampleAppNewArchEnabled/${config.surface}`;
                  updateField('surface', fullUri);
                }}
              >
                <ThemedText style={{ fontSize: 10, color: tintColor, fontWeight: 'bold' }}>
                  Use Full URI Format
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={{ marginVertical: 15 }}>
        <ThemedText style={{ marginBottom: 5, fontWeight: 'bold' }}>Preview URL *</ThemedText>
        <ThemedText style={{ fontSize: 12, marginBottom: 5, opacity: 0.7 }}>
          Deep link URL for on-device campaign previews. Use your app's configured schemes: 'myapp://' or 'com.cmtBootCamp.AEPSampleAppNewArchEnabled://'
        </ThemedText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: tintColor,
            padding: 12,
            marginBottom: 10,
            borderRadius: 5,
            color: textColor,
            backgroundColor: backgroundColor
          }}
          value={config.previewUrl}
          onChangeText={(text) => updateField('previewUrl', text)}
          placeholder="e.g., myapp://decisioning-items"
          placeholderTextColor={textColor + '80'}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {/* Quick preset buttons for configured URL schemes */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
          <TouchableOpacity
            style={{
              backgroundColor: tintColor + '20',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: tintColor + '40'
            }}
            onPress={() => updateField('previewUrl', 'myapp://decisioning-items')}
          >
            <ThemedText style={{ fontSize: 12, color: tintColor, fontWeight: 'bold' }}>
              myapp://decisioning-items
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: tintColor + '20',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: tintColor + '40'
            }}
            onPress={() => updateField('previewUrl', 'com.cmtBootCamp.AEPSampleAppNewArchEnabled://decisioning-items')}
          >
            <ThemedText style={{ fontSize: 11, color: tintColor, fontWeight: 'bold' }}>
              Bundle ID Scheme
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginVertical: 15 }}>
        <ThemedText style={{ marginBottom: 5, fontWeight: 'bold' }}>Activity ID (Optional)</ThemedText>
        <ThemedText style={{ fontSize: 12, marginBottom: 5, opacity: 0.7 }}>
          Specific campaign or activity ID for targeted content delivery
        </ThemedText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: tintColor,
            padding: 12,
            marginBottom: 10,
            borderRadius: 5,
            color: textColor,
            backgroundColor: backgroundColor
          }}
          value={config.activityId}
          onChangeText={(text) => updateField('activityId', text)}
          placeholder="Optional activity ID"
          placeholderTextColor={textColor + '80'}
        />
      </View>

      <View style={{ marginVertical: 15 }}>
        <ThemedText style={{ marginBottom: 5, fontWeight: 'bold' }}>Description (Optional)</ThemedText>
        <ThemedText style={{ fontSize: 12, marginBottom: 5, opacity: 0.7 }}>
          Notes about this configuration for your reference
        </ThemedText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: tintColor,
            padding: 12,
            marginBottom: 10,
            borderRadius: 5,
            color: textColor,
            backgroundColor: backgroundColor,
            minHeight: 80
          }}
          value={config.description}
          onChangeText={(text) => updateField('description', text)}
          placeholder="Optional description or notes"
          placeholderTextColor={textColor + '80'}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Action Buttons */}
      <View style={{ marginVertical: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: tintColor,
            padding: 15,
            borderRadius: 5,
            alignItems: 'center',
            marginBottom: 10
          }}
          onPress={saveConfig}
        >
          <ThemedText style={{ color: backgroundColor, fontWeight: 'bold' }}>Save Configuration</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: tintColor + '20',
            borderWidth: 1,
            borderColor: tintColor,
            padding: 15,
            borderRadius: 5,
            alignItems: 'center',
            marginBottom: 10
          }}
          onPress={validateConfig}
        >
          <ThemedText style={{ color: tintColor, fontWeight: 'bold' }}>Validate Configuration</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#ff4444' + '20',
            borderWidth: 1,
            borderColor: '#ff4444',
            padding: 15,
            borderRadius: 5,
            alignItems: 'center'
          }}
          onPress={clearConfig}
        >
          <ThemedText style={{ color: '#ff4444', fontWeight: 'bold' }}>Clear Configuration</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Current Configuration Display */}
      <View style={{ marginTop: 30 }}>
        <ThemedText type="subtitle">Current Configuration:</ThemedText>
        <View style={{ backgroundColor: tintColor + '20', padding: 15, borderRadius: 5, marginTop: 10 }}>
          <ThemedText style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {JSON.stringify(config, null, 2)}
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}
