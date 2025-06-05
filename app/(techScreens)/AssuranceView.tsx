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

import React, {useState, useEffect} from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import {Assurance} from '@adobe/react-native-aepassurance';
import {  useRouter } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '@react-navigation/native';

const AssuranceView = () => {
  const [version, setVersion] = useState('');
  const [sessionURL, setsessionURL] = useState('your-assurance-url');

  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    let isMounted = true;
    Assurance.extensionVersion().then(version => {
      if (isMounted) setVersion(version);
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{marginTop: 75}}>
        <Button onPress={router.back}  title="Go to main page" />
        <ThemedText style={styles.welcome}>Assurance v{version}</ThemedText>
        <Button title="Start Session" onPress={startSessionClicked} />
        <TextInput
          style={{height: 40, margin: 10, backgroundColor: theme.colors.background, color: theme.colors.text}}
          placeholder="assurance://"
          placeholderTextColor={theme.colors.text}
          onChangeText={val => setsessionURL(val)}
        />
      </ScrollView>
    </ThemedView>
  );

  function startSessionClicked() {
    Assurance.startSession(sessionURL);
  }
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
});

export default AssuranceView;
