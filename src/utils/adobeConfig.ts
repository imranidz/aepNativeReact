/*
 * Adobe SDK Initialization Sequence:
 * 1. Set log level to DEBUG
 * 2. Initialize MobileCore with App ID
 * 3. Wait 1 second for initialization to complete
 * 4. Verify all extensions are ready
 * 
 * IMPORTANT: Do not modify this sequence as it ensures proper initialization order
 * and prevents race conditions between MobileCore and extensions.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { MobileCore, LogLevel } from '@adobe/react-native-aepcore';
import { Assurance } from '@adobe/react-native-aepassurance';
import { Edge } from '@adobe/react-native-aepedge';
import { Identity } from '@adobe/react-native-aepedgeidentity';
import { Optimize } from '@adobe/react-native-aepoptimize';
import { Consent } from '@adobe/react-native-aepedgeconsent';
import { Messaging } from '@adobe/react-native-aepmessaging';
import { Places } from '@adobe/react-native-aepplaces';
import { Target } from '@adobe/react-native-aeptarget';
import { UserProfile } from '@adobe/react-native-aepuserprofile';

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
    
    // Apply Messaging configuration
    try {
      const messagingConfig: any = {
        'messaging.eventDataset': '6838c051f861982aef2661be'
      };

      if (Platform.OS === 'ios') {
        messagingConfig['messaging.useSandbox'] = true;
      }

      console.log('Applying Messaging configuration:', messagingConfig);
      await MobileCore.updateConfiguration(messagingConfig);
      console.log('Messaging configuration applied successfully');
    } catch (error) {
      console.error('Error applying Messaging configuration:', error);
    }
    
    // Wait a moment for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify all extensions are ready
    try {
      console.log('Verifying all Adobe extensions are ready...');
      
      const assuranceVersion = await Assurance.extensionVersion();
      console.log('Assurance version:', assuranceVersion);
      
      const edgeVersion = await Edge.extensionVersion();
      console.log('Edge version:', edgeVersion);
      
      const identityVersion = await Identity.extensionVersion();
      console.log('Edge Identity version:', identityVersion);
      
      const optimizeVersion = await Optimize.extensionVersion();
      console.log('Optimize version:', optimizeVersion);
      
      const consentVersion = await Consent.extensionVersion();
      console.log('Edge Consent version:', consentVersion);
      
      const messagingVersion = await Messaging.extensionVersion();
      console.log('Messaging version:', messagingVersion);
      
      const placesVersion = await Places.extensionVersion();
      console.log('Places version:', placesVersion);
      
      const targetVersion = await Target.extensionVersion();
      console.log('Target version:', targetVersion);
      
      const userProfileVersion = await UserProfile.extensionVersion();
      console.log('User Profile version:', userProfileVersion);
      
      console.log('All Adobe extensions verified and ready');
    } catch (error) {
      console.error('Error verifying Adobe extensions:', error);
    }
    
    console.log('Adobe SDK initialized successfully');
  } catch (error) {
    console.error('Error configuring Adobe SDK:', error);
    throw error;
  }
}; 