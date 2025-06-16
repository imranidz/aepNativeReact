import React, { useState, useEffect } from 'react';
import { Button, Text, View, TextInput, ScrollView, Alert, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileCore } from '@adobe/react-native-aepcore';
import styles from '../../styles/styles';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '@react-navigation/native';
import { configureAdobe } from '../../src/utils/adobeConfig';

const { AppIdModule } = NativeModules;
const APP_ID_STORAGE_KEY = '@adobe_app_id';

const AppIdConfigView = () => {
  const [appId, setAppId] = useState('');
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    // Load saved App ID when component mounts
    loadSavedAppId();
  }, []);

  const loadSavedAppId = async () => {
    try {
      const savedAppId = await AsyncStorage.getItem(APP_ID_STORAGE_KEY);
      console.log('Loaded saved App ID:', savedAppId);
      if (savedAppId) {
        setAppId(savedAppId);
        // Configure SDK with saved App ID
        await configureAdobe(savedAppId);
      }
    } catch (error) {
      console.error('Error loading App ID:', error);
    }
  };

  const saveAppId = async () => {
    try {
      if (!appId.trim()) {
        Alert.alert('Error', 'Please enter a valid App ID');
        return;
      }

      console.log('Attempting to save App ID:', appId.trim());
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(APP_ID_STORAGE_KEY, appId.trim());
      console.log('Successfully saved App ID to AsyncStorage');
      
      // Configure Adobe SDK with new App ID
      console.log('Configuring Adobe SDK with App ID:', appId.trim());
      await configureAdobe(appId.trim());
      
      Alert.alert('Success', 'App ID saved and SDK configured successfully');
    } catch (error) {
      console.error('Error saving App ID:', error);
      Alert.alert('Error', 'Failed to save or configure App ID');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ marginTop: 75, paddingBottom: 100 }}>
        <Button onPress={() => router.back()} title="Go to main page" />
        <ThemedText style={styles.welcome}>Adobe App ID Configuration</ThemedText>
        <ThemedText style={styles.text}>Enter your Adobe Launch App ID:</ThemedText>
        <TextInput
          style={{
            height: 40,
            borderColor: theme.colors.border,
            borderWidth: 1,
            margin: 10,
            padding: 10,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
          }}
          value={appId}
          onChangeText={setAppId}
          placeholder="Enter App ID"
        />
        <Button title="Save App ID" onPress={saveAppId} />
        <ThemedText style={styles.text}>
          Current App ID: {appId || 'Not configured'}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
};

export default AppIdConfigView; 