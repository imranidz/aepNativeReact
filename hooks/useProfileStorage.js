import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'userProfile';

export function useProfileStorage() {
  const [profile, setProfile] = useState({ firstName: '', email: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error('Failed to load profile from storage:', error);
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async (newProfile) => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Failed to save profile to storage:', error);
    }
  };

  return { profile, setProfile: saveProfile };
}