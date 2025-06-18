//import React, { useState, useEffect, useRef } from 'react';
//import { Button, View, Alert, TextInput } from 'react-native';
//import { useRouter } from 'expo-router';
//import { Identity } from '@adobe/react-native-aepedgeidentity';
//import { MobileCore, LogLevel, Event } from '@adobe/react-native-aepcore';
//import { Edge } from '@adobe/react-native-aepedge';
//import {
//  Optimize,
//  DecisionScope,
//  Proposition,
//} from '@adobe/react-native-aepoptimize';
//import { ThemedView } from '../../components/ThemedView';
//import { ThemedText } from '../../components/ThemedText';
//import styles from '../../styles/styles';
//import { useThemeColor } from '../../hooks/useThemeColor';

//export default () => {
//  const [version, setVersion] = useState('0.0.0');
//  const [jsonProposition, setJsonProposition] = useState<Proposition>();
//  const [offerContent, setOfferContent] = useState<string>('');
//  const [userDecisionScope, setUserDecisionScope] = useState('');
//  const [isInitialized, setIsInitialized] = useState(false);
//  const isMounted = useRef(true);
//  const router = useRouter();
//  const themedBg = useThemeColor({}, 'background');
//  const themedBorder = useThemeColor({}, 'background');
//  const themedText = useThemeColor({}, 'text');
//  const themedPlaceholder = useThemeColor({}, 'text');
//
//  useEffect(() => {
//    console.log('Initializing...');
//    isMounted.current = true;
//
//    const init = async () => {
//      try {
//        // Initialize MobileCore
//        console.log('Starting Adobe SDK configuration...');
//        console.log('Setting log level to DEBUG');
//        await MobileCore.setLogLevel(LogLevel.DEBUG);
//        
//        console.log('Initializing MobileCore with App ID: d4b7d80f6e21/bc48aefe0e63/launch-a105d946e837-development');
//        await MobileCore.configureWithAppId('d4b7d80f6e21/bc48aefe0e63/launch-a105d946e837-development');
//
//        // Add event listener for Edge response
//        MobileCore.onResponseContent = (event: Event) => {
//          console.log('\n=== Edge Response Event ===');
//          console.log('Response Data:', JSON.stringify(event, null, 2));
//        };
//
//        // Wait for initialization to complete
//        await new Promise(resolve => setTimeout(resolve, 1000));
//
//        // Get versions and identity info
//        const coreVersion = await MobileCore.extensionVersion();
//        console.log('MobileCore version:', coreVersion);
//
//        const optimizeVersion = await Optimize.extensionVersion();
//        console.log('Optimize version:', optimizeVersion);
//
//        const ecid = await Identity.getExperienceCloudId();
//        console.log('ECID:', ecid);
//
//        const identities = await Identity.getIdentities();
//        console.log('Identities:', JSON.stringify(identities, null, 2));
//
//        if (isMounted.current) {
//          setVersion(optimizeVersion);
//          setIsInitialized(true);
//          console.log('SDK initialization completed successfully');
//        }
//      } catch (error) {
//        console.error('Error during initialization:', error);
//        Alert.alert('Error', 'Failed to initialize SDK. Please restart the app.');
//      }
//    };
//
//    init();
//    return () => { isMounted.current = false; };
//  }, []);
//
//  const getPropositions = async () => {
//    if (!isInitialized) {
//      Alert.alert('Error', 'SDK not initialized. Please wait or restart the app.');
//      return;
//    }
//
//    console.log('=== Starting getPropositions Test ===');
//
//    try {
//      // Parse the decision scope from user input
//      try {
//        console.log('Raw input:', userDecisionScope);
//        
//        // Decode base64 string to get raw IDs
//        const decodedString = atob(userDecisionScope.trim());
//        const scopeData = JSON.parse(decodedString);
//        
//        // Get activityId and placementId from xdm fields
//        const activityId = scopeData['xdm:activityId'].replace('dps:', 'xcore:');
//        const placementId = scopeData['xdm:placementId'].replace('dps:', 'xcore:');
//        
//        console.log('Using activityId:', activityId);
//        console.log('Using placementId:', placementId);
//
//        // Create the decision scope string
//        const decisionScopeString = `${activityId}::${placementId}`;
//        console.log('Decision scope string:', decisionScopeString);
//
//        // Create DecisionScope with the combined string
//        const scope = new DecisionScope(decisionScopeString);
//        console.log('Created scope:', scope);
//
//        // Get propositions from cache
//        console.log('\n=== getPropositions Call ===');
//        console.log('Requesting propositions for scope:', scope.name);
//        
//        const propositions = await Optimize.getPropositions([scope]);
//        console.log('Raw propositions response:', propositions);
//        console.log('Propositions size:', propositions?.size);
//
//        if (propositions && propositions.size > 0) {
//          const prop = propositions.get(scope.name);
//          if (prop) {
//            console.log('\n=== Found Proposition ===');
//            console.log('Proposition ID:', prop.id);
//            console.log('Proposition Scope:', prop.scope);
//            console.log('Proposition Items:', prop.items?.length);
//            
//            if (prop.items?.length) {
//              const item = prop.items[0];
//              console.log('\n=== Offer Content ===');
//              console.log('Item ID:', item.id);
//              console.log('Item Schema:', item.schema);
//              console.log('Item Content:', JSON.stringify(item, null, 2));
//              
//              setJsonProposition(prop);
//              setOfferContent(JSON.stringify(item, null, 2));
//              item.displayed(prop);
//            }
//          } else {
//            console.log('No proposition found for scope:', scope.name);
//            Alert.alert('Info', 'No proposition found for the given scope');
//          }
//        } else {
//          console.log('No propositions returned from cache');
//          Alert.alert('Info', 'No propositions returned');
//        }
//
//      } catch (error: unknown) {
//        console.error('Error with decision scope:', error);
//        if (error instanceof SyntaxError) {
//          Alert.alert('Error', 'Invalid base64 encoded JSON format');
//        } else if (error instanceof Error) {
//          Alert.alert('Error', error.message);
//        } else {
//          Alert.alert('Error', 'Invalid decision scope format');
//        }
//        return;
//      }
//
//    } catch (err) {
//      console.error('Unexpected error:', err);
//      Alert.alert('Error', 'Something went wrong');
//    }
//  };
//
//  // Add new function for direct event
//  const sendDirectEvent = async () => {
//    if (!isInitialized) {
//      Alert.alert('Error', 'SDK not initialized. Please wait or restart the app.');
//      return;
//    }
//
//    console.log('=== Starting Direct Event Test ===');
//
//    try {
//      // Get ECID
//      let ecid;
//      try {
//        ecid = await Identity.getExperienceCloudId();
//        console.log('ECID:', ecid);
//      } catch (error) {
//        console.error('Error getting ECID:', error);
//        Alert.alert('Error', 'Failed to get ECID. Please try again.');
//        return;
//      }
//
//      // Parse the decision scope from user input
//      try {
//        console.log('Raw input:', userDecisionScope);
//        
//        // Decode base64 string to get raw IDs
//        const decodedString = atob(userDecisionScope.trim());
//        const scopeData = JSON.parse(decodedString);
//        
//        // Get activityId and placementId from xdm fields
//        const activityId = scopeData['xdm:activityId'].replace('dps:', 'xcore:');
//        const placementId = scopeData['xdm:placementId'].replace('dps:', 'xcore:');
//        
//        console.log('Using activityId:', activityId);
//        console.log('Using placementId:', placementId);
//
//        // Create the decision scope string
//        const decisionScopeString = `${activityId}::${placementId}`;
//        console.log('Decision scope string:', decisionScopeString);
//
//        // Prepare event data
//        const eventData = {
//          eventName: 'Edge Optimize Personalization Request',
//          eventType: 'com.adobe.eventtype.edge',
//          eventSource: 'com.adobe.eventsource.requestcontent',
//          eventData: {
//            ACPExtensionEventData: {
//              xdm: {
//                propositionRequests: [
//                  {
//                    'xdm:activityId': activityId,
//                    'xdm:placementId': placementId
//                  }
//                ],
//                profiles: [
//                  {
//                    'xdm:identityMap': {
//                      ecid: [
//                        {
//                          'xdm:id': ecid,
//                          primary: true
//                        }
//                      ]
//                    }
//                  }
//                ],
//                allowDuplicatePropositions: {
//                  'xdm:acrossActivities': true,
//                  'xdm:acrossPlacements': true
//                },
//                responseFormat: {
//                  'xdm:includeContent': true,
//                  'xdm:includeMetadata': {
//                    'xdm:activity': ['name'],
//                    'xdm:option': ['name'],
//                    'xdm:placement': ['name']
//                  }
//                }
//              }
//            }
//          }
//        };
//
//        console.log('\n=== Sending Direct Event ===');
//        console.log('Event Data:', JSON.stringify(eventData, null, 2));
//
//        // Send the event using Edge extension
//        const response = await Edge.sendEvent(eventData.eventData);
//        console.log('\n=== Edge Response Event ===');
//        console.log('Response Data:', JSON.stringify(response, null, 2));
//
//        // Wait for processing
//        console.log('Waiting for event processing...');
//        await new Promise(resolve => setTimeout(resolve, 2000));
//
//        // Get propositions from cache
//        console.log('\n=== getPropositions Call ===');
//        const scope = new DecisionScope(decisionScopeString);
//        const propositions = await Optimize.getPropositions([scope]);
//        console.log('Response:', {
//          scope: scope.name,
//          propositions: propositions ? Object.fromEntries(propositions) : null,
//          size: propositions?.size
//        });
//
//        if (propositions && propositions.size > 0) {
//          const prop = propositions.get(scope.name);
//          if (prop) {
//            console.log('Found proposition:', JSON.stringify(prop, null, 2));
//            setJsonProposition(prop);
//            if (prop.items?.length) {
//              const item = prop.items[0];
//              console.log('Offer content:', JSON.stringify(item, null, 2));
//              setOfferContent(JSON.stringify(item, null, 2));
//              item.displayed(prop);
//            }
//          } else {
//            Alert.alert('Info', 'No proposition found for the given scope');
//          }
//        } else {
//          Alert.alert('Info', 'No propositions returned');
//        }
//
//      } catch (error: unknown) {
//        console.error('Error with decision scope:', error);
//        if (error instanceof SyntaxError) {
//          Alert.alert('Error', 'Invalid base64 encoded JSON format');
//        } else if (error instanceof Error) {
//          Alert.alert('Error', error.message);
//        } else {
//          Alert.alert('Error', 'Invalid decision scope format');
//        }
//        return;
//      }
//
//    } catch (err) {
//      console.error('Unexpected error:', err);
//      Alert.alert('Error', 'Something went wrong');
//    }
//  };
//
//  const renderProposition = () => {
//    if (jsonProposition?.items?.length) {
//      const item = jsonProposition.items[0];
//      return (
//        <View style={{ margin: 10 }}>
//          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
//            Offer Content:
//          </ThemedText>
//          <ThemedText style={{ fontSize: 14, fontFamily: 'monospace' }}>
//            {offerContent}
//          </ThemedText>
//        </View>
//      );
//    }
//    return <ThemedText>No proposition available</ThemedText>;
//  };
//
//  return (
//    <ThemedView style={{ ...styles.container, marginTop: 30 }}>
//      <Button onPress={() => router.back()} title="Go back" />
//      <ThemedText style={styles.welcome}>Optimize Test</ThemedText>
//      <ThemedView style={{ margin: 10, padding: 10, borderWidth: 1, borderColor: themedBorder, borderRadius: 8, backgroundColor: themedBg }}>
//        <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>SDK & Identity Info</ThemedText>
//        <ThemedText>Optimize SDK Version: {version}</ThemedText>
//        <ThemedText>Status: {isInitialized ? 'SDK Initialized' : 'Initializing...'}</ThemedText>
//        <ThemedText style={{ marginTop: 10, fontSize: 12 }}>
//          Enter base64 encoded JSON with xdm:activityId and xdm:placementId
//        </ThemedText>
//      </ThemedView>
//      <View style={{ margin: 5 }}>
//        <TextInput
//          style={{
//            borderWidth: 1,
//            borderColor: themedBorder,
//            padding: 10,
//            margin: 5,
//            color: themedText,
//          }}
//          placeholder='Enter base64 encoded decision scope'
//          placeholderTextColor={themedPlaceholder}
//          value={userDecisionScope}
//          onChangeText={setUserDecisionScope}
//        />
//        <ThemedText style={{ fontSize: 12, marginLeft: 5, marginBottom: 10 }}>
//          Example: eyJ4ZG06YWN0aXZpdHlJZCI6ImRwczpvZmZlci1hY3Rpdml0eToxYWQwNTFiMjhjZjlhOWZkIiwieGRtOnBsYWNlbWVudElkIjoiZHBzOm9mZmVyLXBsYWNlbWVudDoxYWQwNGM2YzA2NWQxYzcyIn0=
//        </ThemedText>
//        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
//          <Button
//            title={isInitialized ? "Update & Get Props" : "Initializing..."} 
//            onPress={getPropositions}
//            disabled={!isInitialized}
//          />
//          <Button
//            title={isInitialized ? "Send Direct Event" : "Initializing..."} 
//            onPress={sendDirectEvent}
//            disabled={!isInitialized}
//          />
//        </View>
//      </View>
//      <ThemedText style={styles.welcome}>Proposition</ThemedText>
//      {renderProposition()}
//    </ThemedView>
//  );
//};
