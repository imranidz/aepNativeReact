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
import {MobileCore} from '@adobe/react-native-aepcore';
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
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [lastValidationTime, setLastValidationTime] = useState<Date | null>(null);

  const router = useRouter();
  const theme = useTheme();

  // Enhanced session validation function
  const validateSession = async (): Promise<boolean> => {
    try {
      // Check if extension is still available
      const currentVersion = await Assurance.extensionVersion();
      if (!currentVersion) {
        setConnectionStatus('Extension not available');
        return false;
      }

      // Test the session by sending a test event (this will appear in Assurance if connected)
      const testEventData = {
        validation: true,
        appVersion: version,
        sessionURL: sessionURL,
        timestamp: Date.now(),
      };

      // Dispatch test event using MobileCore.trackAction (which works better with Assurance)
      await MobileCore.trackAction('assurance.session.validation', testEventData);
      
      setConnectionStatus('Connected - Test event sent');
      setLastValidationTime(new Date());
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionStatus(`Validation failed: ${errorMessage}`);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let healthCheckInterval: NodeJS.Timeout | null = null;
    
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
            
            // Validate the reconnected session
            await validateSession();
            
            // Set up periodic health checks (every 30 seconds)
            healthCheckInterval = setInterval(async () => {
              if (isMounted) {
                const isValid = await validateSession();
                if (!isValid) {
                  setIsSessionActive(false);
                  if (healthCheckInterval) {
                    clearInterval(healthCheckInterval);
                  }
                }
              }
            }, 30000);
          } catch (error) {
            console.error('Error reconnecting to session:', error);
            setIsSessionActive(false);
            setConnectionStatus('Failed to reconnect');
          }
        } else if (isMounted) {
          setConnectionStatus('No saved session');
        }
      } catch (error) {
        console.error('Error during Assurance initialization:', error);
      }
    };

    initializeAssurance();

    return () => { 
      isMounted = false;
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
    };
  }, []);

  const startSessionClicked = async () => {
    try {
      if (!sessionURL.trim()) {
        Alert.alert('Error', 'Please enter a valid Assurance session URL');
        return;
      }

      setConnectionStatus('Starting session...');

      // Save the session URL
      await AsyncStorage.setItem(ASSURANCE_URL_KEY, sessionURL.trim());
      
      // Start the Assurance session
      console.log('Starting Assurance session with URL:', sessionURL.trim());
      await Assurance.startSession(sessionURL.trim());
      
      // Check session status
      const version = await Assurance.extensionVersion();
      console.log('Assurance version after session start:', version);
      
      setIsSessionActive(true);
      
      // Validate the new session
      const isValid = await validateSession();
      if (isValid) {
        Alert.alert('Success', 'Assurance session started and validated successfully');
        
        // Set up periodic health checks (every 30 seconds)
        const healthCheckInterval = setInterval(async () => {
          const isStillValid = await validateSession();
          if (!isStillValid) {
            setIsSessionActive(false);
            clearInterval(healthCheckInterval);
          }
        }, 30000);
      } else {
        Alert.alert('Warning', 'Session started but validation failed');
      }
    } catch (error) {
      console.error('Error starting Assurance session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionStatus(`Start failed: ${errorMessage}`);
      Alert.alert('Error', 'Failed to start Assurance session');
      setIsSessionActive(false);
    }
  };

  const testConnection = async () => {
    const isValid = await validateSession();
    Alert.alert(
      'Connection Test',
      isValid 
        ? 'Connection is working! Check the Assurance web interface for the test event.' 
        : 'Connection validation failed. Check console logs for details.'
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{marginTop: 75, paddingBottom: 100}}>
        <Button onPress={router.back} title="Go to main page" />
        <ThemedText style={styles.welcome}>Assurance v{version}</ThemedText>
        
        <ThemedText style={styles.status}>
          Session Status: {isSessionActive ? '🟢 Active' : '🔴 Inactive'}
        </ThemedText>

        <ThemedText style={[styles.status, {fontSize: 14, color: theme.colors.text}]}>
          Connection: {connectionStatus}
        </ThemedText>

        {lastValidationTime && (
          <ThemedText style={[styles.status, {fontSize: 12, color: theme.colors.text}]}>
            Last validated: {lastValidationTime.toLocaleTimeString()}
          </ThemedText>
        )}

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

        {isSessionActive && (
          <Button 
            title="Test Connection" 
            onPress={testConnection}
            color="#4CAF50"
          />
        )}
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
