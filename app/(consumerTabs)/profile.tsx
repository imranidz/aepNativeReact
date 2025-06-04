import React, { useCallback, useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="person" size={48} color="#007AFF" />
      <Text style={{ fontSize: 24, marginTop: 12 }}>Profile</Text>
      <View style={{ marginTop: 24, width: '80%' }}>
        {loggedIn ? (
          <>
            <Text style={{ marginBottom: 12 }}>Welcome, {firstName}!</Text>
            <Text style={{ marginBottom: 12 }}>Email: {email}</Text>
            <Button title="Log Out" onPress={handleLogout} />
          </>
        ) : (
          <>
            <TextInput
              placeholder="First Name"
              value={inputFirstName}
              onChangeText={setInputFirstName}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
              autoCapitalize="words"
            />
            <TextInput
              placeholder="Email Address"
              value={inputEmail}
              onChangeText={setInputEmail}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Password"
              value={inputPassword}
              onChangeText={setInputPassword}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
              secureTextEntry
            />
            {error ? <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text> : null}
            <Button title="Log In" onPress={handleLogin} />
          </>
        )}
      </View>
    </View>
  );
}
