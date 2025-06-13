import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

const { AppIdModule } = NativeModules;

export const APP_ID_STORAGE_KEY = '@adobe_app_id';

export const configureWithAppId = async (appId: string) => {
  try {
    await AsyncStorage.setItem(APP_ID_STORAGE_KEY, appId);
    await AppIdModule.configureWithAppId(appId);
  } catch (error) {
    console.error('Error configuring Adobe App ID:', error);
    throw error;
  }
};

export const getStoredAppId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(APP_ID_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting stored App ID:', error);
    return null;
  }
};

export const initializeAdobe = async () => {
  try {
    const appId = await getStoredAppId();
    if (appId) {
      await AppIdModule.configureWithAppId(appId);
    }
  } catch (error) {
    console.error('Error initializing Adobe:', error);
  }
}; 