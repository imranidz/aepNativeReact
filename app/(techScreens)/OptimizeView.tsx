/**
 * Adobe Mobile SDK Optimize (ODE) Example
 * 
 * ✅ Modern, clear pattern using proper DecisionScope constructor
 * ✅ Shows how to attach ECID as identityMap
 * ✅ Uses updatePropositions + getPropositions properly
 * ✅ Includes onPropositionUpdate listener
 * ✅ Easy to copy & adapt for different Activity/Placement pairs
 * 
 * Author: ChatGPT for Cursor, 2025
 */

import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Identity } from '@adobe/react-native-aepedgeidentity';
import { MobileCore, LogLevel } from '@adobe/react-native-aepcore';
import { Optimize, DecisionScope, Proposition } from '@adobe/react-native-aepoptimize';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';

export default function OptimizeView() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // === React State ===
  const [version, setVersion] = useState('0.0.0');
  const [proposition, setProposition] = useState<Proposition | null>(null);
  const [decisionScopeInput, setDecisionScopeInput] = useState('');

  // === Construct the DecisionScope properly ===
  const getDecisionScope = () => {
    if (!decisionScopeInput) {
      Alert.alert('Error', 'Please enter a decision scope');
      return null;
    }
    return new DecisionScope(decisionScopeInput);
  };

  /**
   * 1️⃣  Setup: configure MobileCore and log versions once at startup.
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        await MobileCore.setLogLevel(LogLevel.DEBUG);
        const ver = await Optimize.extensionVersion();
        console.log("Optimize extension version:", ver);
        setVersion(ver);
      } catch (e) {
        console.error(e);
      }
    };
    initialize();

    /**
     * 2️⃣  Listen to incoming proposition updates.
     * The callback runs whenever Edge returns new offers.
     */
    Optimize.onPropositionUpdate({
      call: (props) => {
        console.log("🔵 onPropositionUpdate received props:", JSON.stringify(props, null, 2));
        const scope = getDecisionScope();
        console.log("🔵 Current scope:", scope?.getName());
        if (scope) {
          const prop = props.get(scope.getName());
          console.log("🔵 Found proposition for scope:", scope.getName(), prop);
          if (prop) {
            console.log("🔵 Setting proposition:", JSON.stringify(prop, null, 2));
            setProposition(prop);
          } else {
            console.log("🔵 No proposition found for scope:", scope.getName());
          }
        } else {
          console.log("🔵 No scope available for proposition update");
        }
      }
    });
  }, []);

  /**
   * 3️⃣  Request new propositions from Edge.
   * This uses ECID as identity and adds it in the XDM payload.
   */
  const updatePropositions = async () => {
    try {
      const scope = getDecisionScope();
      if (!scope) return;

      const ecid = await Identity.getExperienceCloudId();
      console.log("🔵 ECID:", ecid);

      const xdm = new Map();
      xdm.set("eventType", "personalization.request");
      xdm.set("identityMap", {
        ECID: [{ id: ecid, primary: true }]
      });

      console.log("🔵 Calling updatePropositions with:", {
        scope: scope.getName(),
        xdm: Object.fromEntries(xdm)
      });

      // Set up a promise to wait for the proposition update
      const propositionPromise = new Promise<Proposition | null>((resolve) => {
        const timeout = setTimeout(() => {
          console.log("🔵 Timeout waiting for proposition update");
          resolve(null);
        }, 5000); // 5 second timeout

        // Override the existing callback temporarily
        const originalCallback = Optimize.onPropositionUpdate;
        Optimize.onPropositionUpdate({
          call: (props) => {
            console.log("🔵 onPropositionUpdate received props:", JSON.stringify(props, null, 2));
            const prop = props.get(scope.getName());
            if (prop) {
              console.log("🔵 Found proposition in callback:", JSON.stringify(prop, null, 2));
              clearTimeout(timeout);
              resolve(prop);
            }
          }
        });
      });

      // Call updatePropositions
      await Optimize.updatePropositions([scope], xdm);
      console.log("🔵 updatePropositions called successfully");

      // Wait for the proposition update
      const prop = await propositionPromise;
      if (prop) {
        console.log("🔵 Setting proposition from callback:", JSON.stringify(prop, null, 2));
        setProposition(prop);
      } else {
        console.log("🔵 No proposition received in callback");
      }

      Alert.alert("Success", "Proposition update request sent.");
    } catch (err) {
      console.error("🔴 Error in updatePropositions:", err);
      Alert.alert("Error", "Failed to update propositions.");
    }
  };

  /**
   * 4️⃣  Read propositions from local SDK cache.
   * Call after updatePropositions to verify.
   */
  const getCachedPropositions = async () => {
    const scope = getDecisionScope();
    if (!scope) return;

    const props = await Optimize.getPropositions([scope]);
    console.log("Cached props:", props);
    const prop = props.get(scope.getName());
    if (prop) {
      setProposition(prop);
      Alert.alert("Success", "Got proposition from cache.");
    } else {
      Alert.alert("Info", "No proposition found in cache.");
    }
  };

  /**
   * 5️⃣  Clear local SDK cache.
   * Helpful for testing or switching activities.
   */
  const clearCache = () => {
    Optimize.clearCachedPropositions();
    setProposition(null);
    Alert.alert("Cleared", "Proposition cache cleared.");
  };

  const renderPropositionContent = (proposition: Proposition) => {
    if (!proposition?.items || proposition.items.length === 0) {
      return <ThemedText>No proposition content available.</ThemedText>;
    }

    const item = proposition.items[0];
    console.log("Rendering proposition item:", JSON.stringify(item, null, 2));

    try {
      // Try to parse as JSON if it's a JSON string
      const content = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
      return (
        <View style={{ backgroundColor: tintColor + '20', padding: 10, borderRadius: 5 }}>
          <ThemedText style={{ marginBottom: 5, fontWeight: 'bold' }}>Format: {item.format}</ThemedText>
          <ThemedText style={{ marginBottom: 5, fontWeight: 'bold' }}>Schema: {item.schema}</ThemedText>
          <ThemedText style={{ marginBottom: 5, fontWeight: 'bold' }}>Content:</ThemedText>
          <ThemedText style={{ fontFamily: 'monospace' }}>
            {JSON.stringify(content, null, 2)}
          </ThemedText>
        </View>
      );
    } catch (e) {
      console.error("Error parsing proposition content:", e);
      // If not JSON, display as is
      return (
        <View style={{ backgroundColor: tintColor + '20', padding: 10, borderRadius: 5 }}>
          <ThemedText style={{ marginBottom: 5, fontWeight: 'bold' }}>Format: {item.format}</ThemedText>
          <ThemedText style={{ marginBottom: 5, fontWeight: 'bold' }}>Schema: {item.schema}</ThemedText>
          <ThemedText style={{ marginBottom: 5, fontWeight: 'bold' }}>Content:</ThemedText>
          <ThemedText>{item.content}</ThemedText>
        </View>
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={{ fontSize: 16, color: tintColor }}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Optimize</ThemedText>
        <View style={{ width: 50 }} />
      </View>

      <ThemedText>SDK Version: {version}</ThemedText>

      <View style={{ marginVertical: 10 }}>
        <ThemedText style={{ marginBottom: 5 }}>Decision Scope:</ThemedText>
        <TextInput
          style={{ 
            borderWidth: 1, 
            borderColor: tintColor, 
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
            color: textColor,
            backgroundColor: backgroundColor
          }}
          value={decisionScopeInput}
          onChangeText={setDecisionScopeInput}
          placeholder="Enter your decision scope"
          placeholderTextColor={textColor + '80'}
          multiline
        />
      </View>

      <View style={{ marginVertical: 10 }}>
        <TouchableOpacity 
          style={{ 
            backgroundColor: tintColor, 
            padding: 10, 
            borderRadius: 5,
            alignItems: 'center'
          }}
          onPress={updatePropositions}
        >
          <ThemedText style={{ color: backgroundColor }}>Update Propositions</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={{ marginVertical: 10 }}>
        <TouchableOpacity 
          style={{ 
            backgroundColor: tintColor, 
            padding: 10, 
            borderRadius: 5,
            alignItems: 'center'
          }}
          onPress={getCachedPropositions}
        >
          <ThemedText style={{ color: backgroundColor }}>Get Cached Propositions</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={{ marginVertical: 10 }}>
        <TouchableOpacity 
          style={{ 
            backgroundColor: tintColor, 
            padding: 10, 
            borderRadius: 5,
            alignItems: 'center'
          }}
          onPress={clearCache}
        >
          <ThemedText style={{ color: backgroundColor }}>Clear Proposition Cache</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 30 }}>
        <ThemedText type="subtitle">Current Proposition:</ThemedText>
        {proposition ? (
          renderPropositionContent(proposition)
        ) : (
          <ThemedText>No proposition yet.</ThemedText>
        )}
      </View>
    </ScrollView>
  );
}

/**
 * 📌 Cursor Notes:
 * - This example uses `DecisionScope(activityId, placementId, itemCount)` for clarity.
 * - It shows exactly how to attach ECID to the XDM request.
 * - `updatePropositions` always hits Edge → then cache is filled.
 * - `getPropositions` reads from local SDK memory.
 * - `onPropositionUpdate` auto-updates state whenever new data arrives.
 * - Replace placeholder IDs with your real Activity & Placement.
 */
