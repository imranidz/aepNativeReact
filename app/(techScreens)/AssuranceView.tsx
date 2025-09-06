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

import React, {useState, useEffect, useRef} from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import {Assurance} from '@adobe/react-native-aepassurance';
import {MobileCore} from '@adobe/react-native-aepcore';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ASSURANCE_URL_KEY = '@adobe_assurance_url';
const ASSURANCE_SESSION_NAME_KEY = '@adobe_assurance_session_name';

const AssuranceView = () => {
  const [version, setVersion] = useState('');
  const [sessionURL, setSessionURL] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [lastValidationTime, setLastValidationTime] = useState<Date | null>(null);
  const [healthCheckInterval, setHealthCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [validationAttempts, setValidationAttempts] = useState(0);
  const [appStateVisible, setAppStateVisible] = useState<AppStateStatus>(AppState.currentState);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [sessionName, setSessionName] = useState('');
  const [parsedSessionInfo, setParsedSessionInfo] = useState<{id: string, name: string} | null>(null);

  const router = useRouter();
  const theme = useTheme();

  // Function to parse session information from Assurance URL
  const parseSessionInfo = (url: string): {id: string, name: string} | null => {
    if (!url || !url.startsWith('assurance://')) {
      return null;
    }

    try {
      // Extract the session ID from the URL
      // Format: assurance://sessionId?params
      const urlWithoutProtocol = url.replace('assurance://', '');
      const sessionId = urlWithoutProtocol.split('?')[0];
      
      // Try to create a readable name from the session ID
      let displayName = '';
      if (sessionId) {
        // If it's a long UUID-like string, show first 8 characters
        if (sessionId.length > 20) {
          displayName = `Session ${sessionId.substring(0, 8)}...`;
        } else {
          displayName = `Session ${sessionId}`;
        }
      }

      // Check URL parameters for any additional info
      const urlParams = new URLSearchParams(urlWithoutProtocol.split('?')[1] || '');
      const orgId = urlParams.get('orgId');
      if (orgId) {
        displayName += ` (${orgId.substring(0, 8)}...)`;
      }

      return {
        id: sessionId,
        name: displayName
      };
    } catch (error) {
      console.error('Error parsing Assurance URL:', error);
      return null;
    }
  };

  // More robust session validation function
  const validateSession = async (isManualTest: boolean = false): Promise<boolean> => {
    const attemptId = Math.random().toString(36).substr(2, 9);
    const currentAttempt = validationAttempts + 1;
    setValidationAttempts(currentAttempt);

    try {
      // Check if extension is still available
      const currentVersion = await Assurance.extensionVersion();
      if (!currentVersion) {
        setConnectionStatus('❌ Extension not available');
        return false;
      }

      if (isManualTest) {
        setConnectionStatus('🔄 Testing connection...');
      }

      // REALITY CHECK: We can't actually verify if Assurance web interface receives our events
      // The Adobe SDK doesn't provide connection status APIs
      // This is a fundamental limitation of the current SDK architecture
      
      // What we CAN do:
      // 1. Verify the extension is loaded
      // 2. Attempt to send events (but we won't know if they reach Assurance)
      // 3. Monitor for common failure patterns
      // 4. Provide manual recovery options

      const validationEventData = {
        validation: true,
        attemptId: attemptId,
        attemptNumber: currentAttempt,
        appVersion: version,
        sessionURL: sessionURL,
        timestamp: Date.now(),
        appState: appState.current,
        isManualTest: isManualTest,
      };

      console.log(`🔍 Validation attempt ${currentAttempt} (${attemptId}):`, validationEventData);

      // Send validation event
      await MobileCore.trackAction('assurance.connection.validation', validationEventData);
      
      // Send a second event to test consistency
      await MobileCore.trackAction('assurance.connection.heartbeat', {
        heartbeatId: attemptId,
        timestamp: Date.now()
      });

      const statusMessage = isManualTest 
        ? '✅ Test events sent successfully'
        : `📡 Events sent (attempt #${currentAttempt})`;
      
      setConnectionStatus(statusMessage);
      setLastValidationTime(new Date());
      
      // IMPORTANT NOTE: Success here only means we sent events to the Adobe SDK
      // It does NOT guarantee the Assurance web interface received them
      console.log(`✅ Validation ${attemptId} completed - but this only confirms SDK is responding, not actual Assurance connection`);
      
      return true;
    } catch (error) {
      console.error(`❌ Session validation failed (attempt ${currentAttempt}):`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionStatus(`❌ Validation failed: ${errorMessage}`);
      return false;
    }
  };

  // Function to attempt session recovery
  const attemptSessionRecovery = async (): Promise<boolean> => {
    if (!sessionURL) return false;

    try {
      console.log('🔄 Attempting session recovery...');
      setConnectionStatus('🔄 Attempting session recovery...');
      
      // Try to restart the session
      await Assurance.startSession(sessionURL);
      
      // Wait a moment for the session to establish
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate the recovered session
      const isValid = await validateSession();
      
      if (isValid) {
        console.log('✅ Session recovery successful');
        setConnectionStatus('✅ Session recovered successfully');
        return true;
      } else {
        console.log('❌ Session recovery failed validation');
        setConnectionStatus('❌ Session recovery failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Session recovery failed:', error);
      setConnectionStatus('❌ Recovery failed');
      return false;
    }
  };

  // App State monitoring for session recovery
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('🔄 App state changed:', appState.current, '->', nextAppState);
      
      if ((appState.current === 'inactive' || appState.current === 'background') && nextAppState === 'active') {
        console.log('📱 App returned to foreground - checking session...');
        
        // App came to foreground, try to recover session if we have one
        if (isSessionActive && sessionURL) {
          console.log('🔄 Attempting session recovery after app became active...');
          attemptSessionRecovery();
        }
      }
      
      appState.current = nextAppState;
      setAppStateVisible(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [isSessionActive, sessionURL]);

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

        // Then load saved session URL and name
        const savedURL = await AsyncStorage.getItem(ASSURANCE_URL_KEY);
        const savedSessionName = await AsyncStorage.getItem(ASSURANCE_SESSION_NAME_KEY);
        
        if (savedURL && isMounted) {
          setSessionURL(savedURL);
          if (savedSessionName) {
            setSessionName(savedSessionName);
          }
          
          // Parse session info from URL
          const sessionInfo = parseSessionInfo(savedURL);
          if (sessionInfo) {
            setParsedSessionInfo(sessionInfo);
          }
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
            const newHealthCheckInterval = setInterval(async () => {
              if (isMounted) {
                const isValid = await validateSession();
                if (!isValid) {
                  console.warn('Health check failed, but keeping session marked as active. Use manual disconnect if needed.');
                  // Don't automatically set session to inactive to prevent button disappearing
                  // setIsSessionActive(false);
                }
              }
            }, 30000);
            setHealthCheckInterval(newHealthCheckInterval);
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
        setHealthCheckInterval(null);
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

      // Save the session URL and name
      await AsyncStorage.setItem(ASSURANCE_URL_KEY, sessionURL.trim());
      if (sessionName.trim()) {
        await AsyncStorage.setItem(ASSURANCE_SESSION_NAME_KEY, sessionName.trim());
      }
      
      // Parse and store session info
      const sessionInfo = parseSessionInfo(sessionURL.trim());
      if (sessionInfo) {
        setParsedSessionInfo(sessionInfo);
      }
      
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
        const newHealthCheckInterval = setInterval(async () => {
          const isStillValid = await validateSession();
          if (!isStillValid) {
            console.warn('Health check failed, but keeping session marked as active. Use manual disconnect if needed.');
            // Don't automatically set session to inactive to prevent button disappearing
            // setIsSessionActive(false);
          }
        }, 30000);
        setHealthCheckInterval(newHealthCheckInterval);
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
    const isValid = await validateSession(true);
    
    Alert.alert(
      'Connection Test Result',
      isValid 
        ? '✅ Test events sent successfully!\n\n⚠️ Important: This only confirms the Adobe SDK is working. To verify the actual Assurance connection, check if your test events appear in the Assurance web interface.\n\nLook for "assurance.connection.validation" and "assurance.connection.heartbeat" events.' 
        : '❌ Connection validation failed!\n\nThe Adobe SDK is not responding properly. Check console logs for details and try restarting the session.',
      [
        {
          text: 'View Logs',
          onPress: () => console.log('Recent validation attempts:', validationAttempts)
        },
        { text: 'OK' }
      ]
    );
  };

  const recoverConnection = async () => {
    const success = await attemptSessionRecovery();
    Alert.alert(
      'Session Recovery',
      success 
        ? '✅ Session recovery completed! Check the Assurance web interface to confirm connection.' 
        : '❌ Session recovery failed. You may need to manually restart the session with a fresh URL.',
      success ? [{ text: 'OK' }] : [
        { text: 'Manual Restart', onPress: () => setIsSessionActive(false) },
        { text: 'OK' }
      ]
    );
  };

  const disconnectSession = async () => {
    try {
      // Clear the health check interval
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        setHealthCheckInterval(null);
      }

      // Send a disconnect event to Assurance (if still connected)
      try {
        await MobileCore.trackAction('assurance.session.disconnect', {
          sessionURL: sessionURL,
          disconnectedAt: Date.now(),
          reason: 'Manual disconnect'
        });
      } catch (error) {
        console.log('Could not send disconnect event (session may already be disconnected):', error);
      }

      // Clear saved session name but KEEP the URL for easy restart
      await AsyncStorage.removeItem(ASSURANCE_SESSION_NAME_KEY);
      // Note: We're NOT removing ASSURANCE_URL_KEY so user can easily restart

      // Reset UI state but KEEP sessionURL for easy restart
      setIsSessionActive(false);
      // setSessionURL(''); // REMOVED: Keep the URL for easy restart
      setSessionName(''); // Clear custom name
      setConnectionStatus('Disconnected manually - URL preserved for restart');
      setLastValidationTime(null);

      Alert.alert(
        'Disconnected', 
        'Successfully disconnected from Assurance session. Note: The native SDK may continue running until the app is restarted.'
      );

      console.log('Assurance session manually disconnected');
    } catch (error) {
      console.error('Error during manual disconnect:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to disconnect cleanly: ${errorMessage}`);
      
      // Still reset the UI even if there were errors
      setIsSessionActive(false);
      setConnectionStatus('Disconnect error - UI reset');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{marginTop: 75, paddingBottom: 100}}>
        <Button onPress={router.back} title="Go to main page" />
        <ThemedText style={styles.welcome}>Assurance v{version}</ThemedText>
        
        <ThemedText style={styles.status}>
          Session Status: {isSessionActive ? '🟢 Active' : '🔴 Inactive'}
        </ThemedText>

        {/* Display session name if available */}
        {(sessionName || parsedSessionInfo) && (
          <ThemedText style={[styles.status, {fontSize: 16, color: theme.colors.text, fontWeight: 'bold'}]}>
            📋 {sessionName || parsedSessionInfo?.name}
          </ThemedText>
        )}

        <ThemedText style={[styles.status, {fontSize: 14, color: theme.colors.text}]}>
          Connection: {connectionStatus}
        </ThemedText>

        {validationAttempts > 0 && (
          <ThemedText style={[styles.status, {fontSize: 12, color: theme.colors.text}]}>
            Validation attempts: {validationAttempts}
          </ThemedText>
        )}

        {sessionURL && (
          <ThemedText style={[styles.status, {fontSize: 12, color: theme.colors.text}]}>
            Current URL: {sessionURL.length > 30 ? sessionURL.substring(0, 30) + '...' : sessionURL}
          </ThemedText>
        )}

        {parsedSessionInfo && (
          <ThemedText style={[styles.status, {fontSize: 11, color: theme.colors.text}]}>
            Session ID: {parsedSessionInfo.id.length > 15 ? parsedSessionInfo.id.substring(0, 15) + '...' : parsedSessionInfo.id}
          </ThemedText>
        )}

        {lastValidationTime && (
          <ThemedText style={[styles.status, {fontSize: 12, color: theme.colors.text}]}>
            Last test: {lastValidationTime.toLocaleTimeString()}
          </ThemedText>
        )}

        <ThemedText style={[styles.status, {fontSize: 11, color: theme.colors.text, marginTop: 5, fontStyle: 'italic'}]}>
          ⚠️ Note: Adobe SDK doesn't provide real connection status. Use manual tests to verify.
        </ThemedText>

        {/* Session Name Input (Optional) */}
        <TextInput
          style={{
            height: 35,
            margin: 10,
            marginBottom: 5,
            padding: 8,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 5,
            fontSize: 14,
          }}
          placeholder="Session name (optional)"
          placeholderTextColor={theme.colors.text}
          value={sessionName}
          onChangeText={setSessionName}
        />

        {/* Assurance URL Input */}
        <TextInput
          style={{
            height: 40,
            margin: 10,
            marginTop: 0,
            padding: 10,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: 5,
          }}
          placeholder="assurance://..."
          placeholderTextColor={theme.colors.text}
          value={sessionURL}
          onChangeText={(url) => {
            setSessionURL(url);
            // Auto-parse session info when URL changes
            const sessionInfo = parseSessionInfo(url);
            if (sessionInfo) {
              setParsedSessionInfo(sessionInfo);
            } else {
              setParsedSessionInfo(null);
            }
          }}
        />

        <Button 
          title="Start Session" 
          onPress={startSessionClicked}
          disabled={!sessionURL.trim()}
        />

        {isSessionActive && (
          <View style={styles.buttonContainer}>
            <View style={styles.buttonSpacing}>
              <Button 
                title="Test Connection" 
                onPress={testConnection}
                color="#4CAF50"
              />
            </View>
            <View style={styles.buttonSpacing}>
              <Button 
                title="Recover Session" 
                onPress={recoverConnection}
                color="#FF9800"
              />
            </View>
            <View style={styles.buttonSpacing}>
              <Button 
                title="Disconnect Session" 
                onPress={disconnectSession}
                color="#f44336"
              />
            </View>
          </View>
        )}

        {/* Clear URL button (only show if session is inactive and URL exists) */}
        {!isSessionActive && sessionURL && (
          <View style={styles.buttonSpacing}>
            <Button 
              title="Clear Saved URL" 
              onPress={async () => {
                await AsyncStorage.removeItem(ASSURANCE_URL_KEY);
                await AsyncStorage.removeItem(ASSURANCE_SESSION_NAME_KEY);
                setSessionURL('');
                setSessionName('');
                setParsedSessionInfo(null);
                setConnectionStatus('Saved session cleared');
                Alert.alert('Cleared', 'Saved session URL and name have been cleared.');
              }}
              color="#9E9E9E"
            />
          </View>
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
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
  buttonSpacing: {
    marginVertical: 5,
    marginHorizontal: 10,
  },
});

export default AssuranceView;
