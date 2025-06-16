/*
 * Adobe SDK Initialization Sequence:
 * 1. Set log level to DEBUG
 * 2. Initialize MobileCore with App ID
 * 3. Wait 1 second for initialization to complete
 * 4. Verify Assurance extension is ready
 * 
 * IMPORTANT: Do not modify this sequence as it ensures proper initialization order
 * and prevents race conditions between MobileCore and extensions.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import { MobileCore, LogLevel } from '@adobe/react-native-aepcore';
import { Assurance } from '@adobe/react-native-aepassurance';

const { AppIdModule } = NativeModules;

export const APP_ID_STORAGE_KEY = '@adobe_app_id';

export const configureWithAppId = async (appId: string) => {
  try {
    console.log('Configuring native module with App ID:', appId);
    await AsyncStorage.setItem(APP_ID_STORAGE_KEY, appId);
    await AppIdModule.configureWithAppId(appId);
    console.log('Native module configuration successful');
  } catch (error) {
    console.error('Error configuring Adobe App ID:', error);
    throw error;
  }
};

export const getStoredAppId = async (): Promise<string | null> => {
  try {
    const appId = await AsyncStorage.getItem(APP_ID_STORAGE_KEY);
    console.log('Retrieved stored App ID:', appId);
    return appId;
  } catch (error) {
    console.error('Error getting stored App ID:', error);
    return null;
  }
};

export const initializeAdobe = async () => {
  try {
    const appId = await getStoredAppId();
    if (appId) {
      console.log('Initializing Adobe SDK with stored App ID:', appId);
      await configureAdobe(appId);
    } else {
      console.log('No stored App ID found, Adobe SDK not initialized');
    }
  } catch (error) {
    console.error('Error initializing Adobe:', error);
  }
};

export const configureAdobe = async (appId: string) => {
  try {
    console.log('Starting Adobe SDK configuration...');
    
    // Set log level
    console.log('Setting log level to DEBUG');
    MobileCore.setLogLevel(LogLevel.DEBUG);
    
    // Initialize with App ID
    console.log('Initializing MobileCore with App ID:', appId);
    await MobileCore.initializeWithAppId(appId);
    
    // Wait a moment for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify Assurance is ready
    try {
      const version = await Assurance.extensionVersion();
      console.log('Assurance version after initialization:', version);
    } catch (error) {
      console.error('Error verifying Assurance:', error);
    }
    
    console.log('Adobe SDK initialized successfully');
  } catch (error) {
    console.error('Error configuring Adobe SDK:', error);
    throw error;
  }
}; 