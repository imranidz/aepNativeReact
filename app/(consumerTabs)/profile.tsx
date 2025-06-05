import React, { useCallback, useState } from 'react';
import { View, Button, TextInput } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { MobileCore } from '@adobe/react-native-aepcore';

export default function ProfileTab() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputFirstName, setInputFirstName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      MobileCore.trackState('ProfileTab', {
        'web.webPageDetails.name': 'Profile',
        'application.name': 'AEPSampleApp',
      });
      console.log('ProfileTab viewed - trigger Adobe tracking here');
    }, [])
  );

  const handleLogin = () => {
    if (!inputFirstName || !inputEmail || !inputPassword) {
      setError('Please fill in all fields.');
      return;
    }
    setFirstName(inputFirstName);
    setEmail(inputEmail);
    setPassword(''); // Don't store password
    setLoggedIn(true);
    setError('');
    MobileCore.trackAction('login', {
      method: 'basic',
      application: 'AEPSampleApp',
      firstName: inputFirstName,
      email: inputEmail,
    });
    console.log('User logged in - trigger Adobe login tracking here');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setFirstName('');
    setEmail('');
    setInputFirstName('');
    setInputEmail('');
    setInputPassword('');
    setError('');
    MobileCore.trackAction('logout', {
      application: 'AEPSampleApp',
    });
    console.log('User logged out - trigger Adobe logout tracking here');
  };

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="person" size={48} color={colors.primary} />
      <ThemedText type="title" style={{ marginTop: 12 }}>Profile</ThemedText>
      <View style={{ marginTop: 24, width: '80%' }}>
        {loggedIn ? (
          <>
            <ThemedText style={{ marginBottom: 12 }}>Welcome, {firstName}!</ThemedText>
            <ThemedText style={{ marginBottom: 12 }}>Email: {email}</ThemedText>
            <Button title="Log Out" onPress={handleLogout} />
          </>
        ) : (
          <>
            <TextInput
              placeholder="First Name"
              value={inputFirstName}
              onChangeText={setInputFirstName}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8, marginBottom: 12, backgroundColor: colors.card, color: colors.text }}
              placeholderTextColor={colors.text + '99'}
              autoCapitalize="words"
            />
            <TextInput
              placeholder="Email Address"
              value={inputEmail}
              onChangeText={setInputEmail}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8, marginBottom: 12, backgroundColor: colors.card, color: colors.text }}
              placeholderTextColor={colors.text + '99'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Password"
              value={inputPassword}
              onChangeText={setInputPassword}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8, marginBottom: 12, backgroundColor: colors.card, color: colors.text }}
              placeholderTextColor={colors.text + '99'}
              secureTextEntry
            />
            {error ? <ThemedText style={{ color: 'red', marginBottom: 12 }}>{error}</ThemedText> : null}
            <Button title="Log In" onPress={handleLogin} />
          </>
        )}
      </View>
    </ThemedView>
  );
}
