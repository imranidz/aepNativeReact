/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/*
 * Assurance View Initialization Sequence:
 * 1. Get Assurance version first to verify extension is ready
 * 2. Load saved session URL from AsyncStorage
 * 3. If URL exists, attempt to reconnect to existing session
 * 4. Update UI state based on connection status
 * 
 * IMPORTANT: This sequence depends on proper Adobe SDK initialization
 * from adobeConfig.ts. Do not modify the order of operations.
 */

import React, {useState, useEffect} from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {Assurance} from '@adobe/react-native-aepassurance';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ASSURANCE_URL_KEY = '@adobe_assurance_url';

const AssuranceView = () => {
  const [version, setVersion] = useState('');
  const [sessionURL, setSessionURL] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);

  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    let isMounted = true;
    
    // Load saved session URL and initialize
    const initializeAssurance = async () => {
      try {
        // Get Assurance version first
        const version = await Assurance.extensionVersion();
        if (isMounted) {
          setVersion(version);
          console.log('Assurance version:', version);
        }

        // Then load saved session URL
        const savedURL = await AsyncStorage.getItem(ASSURANCE_URL_KEY);
        if (savedURL && isMounted) {
          setSessionURL(savedURL);
          // Try to reconnect to existing session
          try {
            console.log('Attempting to reconnect to existing session:', savedURL);
            await Assurance.startSession(savedURL);
            const newVersion = await Assurance.extensionVersion();
            console.log('Assurance version after reconnect:', newVersion);
            setIsSessionActive(true);
          } catch (error) {
            console.error('Error reconnecting to session:', error);
            setIsSessionActive(false);
          }
        }
      } catch (error) {
        console.error('Error during Assurance initialization:', error);
      }
    };

    initializeAssurance();

    return () => { isMounted = false; };
  }, []);

  const startSessionClicked = async () => {
    try {
      if (!sessionURL.trim()) {
        Alert.alert('Error', 'Please enter a valid Assurance session URL');
        return;
      }

      // Save the session URL
      await AsyncStorage.setItem(ASSURANCE_URL_KEY, sessionURL.trim());
      
      // Start the Assurance session
      console.log('Starting Assurance session with URL:', sessionURL.trim());
      await Assurance.startSession(sessionURL.trim());
      
      // Check session status
      const version = await Assurance.extensionVersion();
      console.log('Assurance version after session start:', version);
      
      setIsSessionActive(true);
      Alert.alert('Success', 'Assurance session started successfully');
    } catch (error) {
      console.error('Error starting Assurance session:', error);
      Alert.alert('Error', 'Failed to start Assurance session');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{marginTop: 75, paddingBottom: 100}}>
        <Button onPress={router.back} title="Go to main page" />
        <ThemedText style={styles.welcome}>Assurance v{version}</ThemedText>
        
        <ThemedText style={styles.status}>
          Session Status: {isSessionActive ? 'Active' : 'Inactive'}
        </ThemedText>

        <TextInput
          style={{
            height: 40,
            margin: 10,
            padding: 10,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }}
          placeholder="assurance://"
          placeholderTextColor={theme.colors.text}
          value={sessionURL}
          onChangeText={setSessionURL}
        />

        <Button 
          title="Start Session" 
          onPress={startSessionClicked}
          disabled={!sessionURL.trim()}
        />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 25,
    textAlign: 'center',
    margin: 10,
    marginTop: 80,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
  },
});

export default AssuranceView;
