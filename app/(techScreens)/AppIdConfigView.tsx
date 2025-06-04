import React, { useState, useEffect } from 'react';
import { Button, Text, View, TextInput, ScrollView, Alert, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileCore } from '@adobe/react-native-aepcore';
import styles from '../../styles/styles';
import { useRouter } from 'expo-router';

const { AppIdModule } = NativeModules;
const APP_ID_STORAGE_KEY = '@adobe_app_id';

const AppIdConfigView = () => {
  const [appId, setAppId] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Load saved App ID when component mounts
    loadSavedAppId();
  }, []);

  const loadSavedAppId = async () => {
    try {
      const savedAppId = await AsyncStorage.getItem(APP_ID_STORAGE_KEY);
      if (savedAppId) {
        setAppId(savedAppId);
        // Configure SDK with saved App ID
        await AppIdModule.configureWithAppId(savedAppId);
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

      // Save to AsyncStorage
      await AsyncStorage.setItem(APP_ID_STORAGE_KEY, appId.trim());
      
      // Configure Adobe SDK with new App ID
      await AppIdModule.configureWithAppId(appId.trim());
      
      Alert.alert('Success', 'App ID saved and configured successfully');
    } catch (error) {
      console.error('Error saving App ID:', error);
      Alert.alert('Error', 'Failed to save or configure App ID');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ marginTop: 75, paddingBottom: 100 }}>
        <Button onPress={() => router.back()} title="Go to main page" />
        <Text style={styles.welcome}>Adobe App ID Configuration</Text>
        <Text style={styles.text}>Enter your Adobe Launch App ID:</Text>
        <TextInput
          style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            margin: 10,
            padding: 10,
          }}
          value={appId}
          onChangeText={setAppId}
          placeholder="Enter App ID"
        />
        <Button title="Save App ID" onPress={saveAppId} />
        <Text style={styles.text}>
          Current App ID: {appId || 'Not configured'}
        </Text>
      </ScrollView>
    </View>
  );
};

export default AppIdConfigView; 