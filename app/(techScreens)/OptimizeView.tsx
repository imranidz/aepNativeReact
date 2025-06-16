import { useTheme } from '@react-navigation/native';
import { Identity, IdentityMap, IdentityItem, AuthenticatedState } from '@adobe/react-native-aepedgeidentity';
import React, {useState, useEffect, useRef} from 'react';
import {RecyclerListView, DataProvider, LayoutProvider} from 'recyclerlistview';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import {WebView} from 'react-native-webview';
import styles from '../../styles/styles';
import {
  Optimize,
  DecisionScope,
  Proposition,
} from '@adobe/react-native-aepoptimize';
import {
  Button,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  Text,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewTypes = {
  header: 0,
  content: 1,
};

const TARGET_OFFER_TYPE_JSON = 'application/json';
const TARGET_OFFER_TYPE_HTML = 'text/html';

const defaultPropositions = {
  textProposition: '',
  imageProposition:
    'https://blog.adobe.com/en/publish/2020/05/28/media_3dfaf748ad02bf771410a771def79c9ad86b1766.jpg',
  htmlProposition:
    '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><p>HTML place holder!</p></body></html>',
  jsonProposition: '{"Type": "JSON place holder"}',
};

export default () => {
  const [version, setVersion] = useState('0.0.0');
  const [textProposition, setTextProposition] = useState<Proposition>();
  const [imageProposition, setImageProposition] = useState<Proposition>();
  const [htmlProposition, setHtmlProposition] = useState<Proposition>();
  const [jsonProposition, setJsonProposition] = useState<Proposition>();
  const [targetProposition, setTargetProposition] = useState<Proposition | undefined>();
  const [userDecisionScope, setUserDecisionScope] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    console.log('Component mounted, initializing...');
    isMounted.current = true;

    // Check if SDK is initialized
    console.log('Checking if SDK is initialized...');
    const isSDKInitialized = true; // Replace with actual check
    if (!isSDKInitialized) {
      console.error('SDK is not initialized');
      return;
    }
    console.log('SDK is initialized');

    // Check network connectivity
    console.log('Checking network connectivity...');
    const isNetworkConnected = true; // Replace with actual check
    if (!isNetworkConnected) {
      console.error('No network connectivity');
      return;
    }
    console.log('Network is connected');

    // Check configuration
    console.log('Checking SDK configuration...');
    const isConfigValid = true; // Replace with actual check
    if (!isConfigValid) {
      console.error('SDK configuration is invalid');
      return;
    }
    console.log('SDK configuration is valid');

    Optimize.extensionVersion().then(version => {
      if (isMounted.current) {
        console.log('Optimize extension version:', version);
        setVersion(version);
      }
    });

    // Ensure SDK is fully initialized before proceeding
    const ensureSDKInitialized = async () => {
      console.log('Ensuring SDK is fully initialized...');
      try {
        // Placeholder for actual SDK readiness check
        const sdkReady = true; // Replace with actual check
        if (!sdkReady) {
          console.error('SDK is not fully ready');
          return;
        }
        console.log('SDK is fully initialized');

        // Set identifiers
        const syncIdentifiers = async () => {
          try {
            // Retrieve the identity map using getIdentities
            const identityData = await Identity.getIdentities();
            console.log('Identity Data:', identityData);

            // Extract ECID and email from the identity map
            const ecidArray = identityData.identityMap.ECID;
            const emailArray = identityData.identityMap.Email;

            if (!ecidArray || ecidArray.length === 0) {
              console.error('ECID not found in identity map');
              return;
            }
            if (!emailArray || emailArray.length === 0) {
              console.error('Email not found in identity map');
              return;
            }

            const ecid = ecidArray[0].id; // Assuming the first entry is the one you need
            const email = emailArray[0].id; // Assuming the first entry is the one you need

            const identityMap = new IdentityMap();
            identityMap.addItem(new IdentityItem(ecid, AuthenticatedState.AMBIGUOUS, false), 'ECID');
            identityMap.addItem(new IdentityItem(email, AuthenticatedState.AUTHENTICATED, true), 'Email');

            Identity.updateIdentities(identityMap);
            console.log('Identifiers updated:', identityMap);

            // Function to log detailed information about the identity map
            const logIdentityMapDetails = (identityMap: { identityMap: { [key: string]: IdentityItem[] } }) => {
              console.log('Logging detailed identity map:');
              for (const [key, items] of Object.entries(identityMap.identityMap)) {
                console.log(`Identifier Type: ${key}`);
                console.log(`Items: ${JSON.stringify(items)}`); // Log the raw items array
                (items as IdentityItem[]).forEach((item: IdentityItem) => {
                  console.log(`  ID: ${item.id}, Authenticated State: ${item.authenticatedState}, Primary: ${item.primary}`);
                });
              }
            };

            // Use this function where you log the identity map
            logIdentityMapDetails(identityData);
          } catch (error) {
            console.error('Error updating identifiers:', error);
          }
        };

        await syncIdentifiers();

        // Load ECID on component mount
        console.log('Attempting to load ECID...');
        const identityMap = await Identity.getIdentities();
        console.log('Identity Map on Mount:', identityMap);

        // Fetch identities to populate identity map
        console.log('Fetching identities...');
        const currentIdentity = await Identity.getIdentities();
        console.log('Identity.getIdentities:', JSON.stringify(currentIdentity));
      } catch (error) {
        console.error('Error during SDK initialization check:', error);
      }
    };

    ensureSDKInitialized();

    // Subscribe to proposition updates
    Optimize.onPropositionUpdate({
      call(propositions) {
        console.log('Proposition update received:', propositions);
        if (isMounted.current && propositions) {
          setJsonProposition(propositions.get(userDecisionScope));
        }
      },
    });

    return () => {
      console.log('Component unmounted, cleaning up...');
      isMounted.current = false;
    };
  }, []);

  const optimizeExtensionVersion = async () => {
    const version = await Optimize.extensionVersion();
    console.log('AdobeExperienceSDK: Optimize version: ' + version);
    setVersion(version);
  };

  const updatePropositions = () => {
    Optimize.updatePropositions([new DecisionScope(userDecisionScope)]);
    console.log('Updated Propositions');
  };

  const getPropositions = async () => {
    console.log('Get Propositions called');
    if (!userDecisionScope) {
      console.error('Error: No decision scope entered');
      Alert.alert('Error', 'Please enter a decision scope before proceeding.');
      return;
    }
    const userScope = new DecisionScope(userDecisionScope);
    console.log('Using decision scope:', userScope.getName());

    // Log the ECID or full identity map
    console.log('Fetching identity map...');
    try {
      const identityMap = await Identity.getIdentities();
      console.log('Identity Map:', identityMap);
    } catch (error) {
      console.error('Error fetching identity map:', error);
    }

    let ecid;
    // Use getExperienceCloudId to retrieve the ECID
    console.log('Fetching ECID...');
    try {
      ecid = await Identity.getExperienceCloudId();
      if (!ecid) {
        console.error('ECID not found');
        return;
      }
      console.log('ECID found:', ecid);
    } catch (error) {
      console.error('Error fetching ECID:', error);
    }

    const xdmData = { "xdm": { "identityMap": { "ECID": { "id": ecid, "primary": true } } } };

    // Adjust the getPropositions call
    console.log('Fetching propositions...');
    try {
      const propositions: Map<string, Proposition> =
        await Optimize.getPropositions([userScope]);
      console.log('Propositions received:', propositions);
      if (propositions) {
        setJsonProposition(propositions.get(userScope.getName()));
      }
    } catch (error) {
      console.error('Error fetching propositions:', error);
    }
  };

  const clearCachedProposition = () => {
    Optimize.clearCachedPropositions();
    console.log('Proposition cache cleared');
  };

  const onPropositionUpdate = () =>
    Optimize.onPropositionUpdate({
      call(propositions: Map<String, Proposition>) {
        if (propositions) {
          setJsonProposition(propositions.get(userDecisionScope));
        }
      },
    });

  const renderTargetOffer = () => {
    if (targetProposition?.items) {
      if (targetProposition.items[0].format === TARGET_OFFER_TYPE_JSON) {
        return (
          <ThemedText
            style={{margin: 10, fontSize: 18}}
            onPress={() => {
              targetProposition?.items[0].tapped(targetProposition);
            }}>
            {targetProposition.items[0].content}
          </ThemedText>
        );
      } else if (targetProposition.items[0].format === TARGET_OFFER_TYPE_HTML) {
        return (
          <TouchableOpacity
            onPress={e => {
              targetProposition?.items[0].tapped(targetProposition);
            }}>
            <View style={{width: width, height: 150}}>
              <WebView
                textZoom={100}
                originWhitelist={['*']}
                source={{html: targetProposition.items[0].content}}
              />
            </View>
          </TouchableOpacity>
        );
      }
    }
    return <ThemedText>Default Target Offer</ThemedText>;
  };

  let dataProvider = new DataProvider((data1, data2) => {
    return data1 !== data2;
  });

  var {width} = Dimensions.get('window');

  let layoutProvider = new LayoutProvider(
    index => {
      if (index % 2 === 0) {
        //View type is for header
        return ViewTypes.header;
      } else {
        //View type is for Content
        return ViewTypes.content;
      }
    },
    (type, dimen) => {
      switch (type) {
        case ViewTypes.header:
          dimen.width = width;
          dimen.height = 50;
          break;

        case ViewTypes.content:
          dimen.width = width;
          dimen.height = 200;
          break;

        default:
          dimen.width = 0;
          dimen.height = 0;
          break;
      }
    },
  );

  let rowRenderer = (type: any, data: any) => {
    switch (type) {
      case ViewTypes.header:
        return (
          <ThemedView>
            <ThemedText style={styles.header}>{data}</ThemedText>
          </ThemedView>
        );

      case ViewTypes.content:
        if (data === textProposition) {
          return (
            <ThemedView>
              <ThemedText
                style={{margin: 10, fontSize: 18}}
                onPress={e => {
                  textProposition?.items[0].tapped(textProposition);
                }}>
                {textProposition?.items[0]
                  ? textProposition.items[0].content
                  : defaultPropositions.textProposition}
              </ThemedText>
            </ThemedView>
          );
        } else if (data === imageProposition) {
          return (
            <ThemedView style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={e => {
                  imageProposition?.items[0].tapped(imageProposition);
                }}>
                <Image
                  style={{width: 100, height: 100, margin: 10}}
                  source={{
                    uri: imageProposition?.items[0]
                      ? imageProposition.items[0].content
                      : defaultPropositions.htmlProposition,
                  }}></Image>
              </TouchableOpacity>
            </ThemedView>
          );
        } else if (data === jsonProposition) {
          return (
            <ThemedText
              style={{margin: 10, fontSize: 18}}
              onPress={e => {
                jsonProposition?.items[0].tapped(jsonProposition);
              }}>
              {' '}
              {jsonProposition?.items?.[0]
                ? jsonProposition.items[0].content
                : defaultPropositions.jsonProposition}
            </ThemedText>
          );
        } else if (data === htmlProposition) {
          return (
            <TouchableOpacity
              onPress={() => {
                htmlProposition?.items[0].tapped(htmlProposition);
              }}>
              <ThemedView style={{width: width, height: 150}}>
                <WebView
                  textZoom={100}
                  originWhitelist={['*']}
                  source={{
                    html: htmlProposition?.items?.[0]
                      ? htmlProposition.items[0].content
                      : defaultPropositions.htmlProposition,
                  }}
                />
              </ThemedView>
            </TouchableOpacity>
          );
        } else if (data === targetProposition) {
          return renderTargetOffer();
        }
        return (
          <ThemedView>
            <ThemedText style={styles.text}>Offer type didn't match</ThemedText>
          </ThemedView>
        );
      default:
        return null;
    }
  };

  var data: any;
  let getContent = () => {
    data = new Array();
    data.push('Text Offer');
    data.push(textProposition);
    data.push('Image Offer');
    data.push(imageProposition);
    data.push('JSON Offer');
    data.push(jsonProposition);
    data.push('HTML Offer');
    data.push(htmlProposition);
    data.push('Target Mbox Offer');
    data.push(targetProposition);
    return dataProvider.cloneWithRows(data);
  };

  let hasBegunScrolling = true;
  let indicesWithData = [1, 3, 5, 7, 9];

  let indicesChangeHandler = (all: any, now: any, notNow: any) => {
    if (hasBegunScrolling && notNow && notNow[0] && notNow[0] === 0) {
      for (const i in all) {
        if (
          indicesWithData.includes(i as any) &&
          typeof data[i] === 'object' &&
          data[i].items
        ) {
          const offer = data[i].items[0];
          const proposition = data[i];
          offer.displayed(proposition);
        }
      }
      hasBegunScrolling = false;
    } else if (
      now &&
      indicesWithData.includes(now[0]) &&
      data[now[0]] &&
      typeof data[now[0]] === 'object' &&
      data[now[0]].items
    ) {
      const offer = data[now[0]].items[0];
      const proposition = data[now[0]];
      offer.displayed(proposition);
    }
  };
  const router = useRouter();

  const handleUserDecisionScopeChange = (text: string) => {
    setUserDecisionScope(text);
    const newDecisionScope = new DecisionScope(text);
    setJsonProposition(undefined); // Clear previous proposition
    Optimize.updatePropositions([newDecisionScope]);
  };

  const handleSaveDecisionScope = async () => {
    try {
      const newDecisionScope = new DecisionScope(userDecisionScope);
      setJsonProposition(undefined); // Clear previous proposition
      await Optimize.updatePropositions([newDecisionScope]);
      await AsyncStorage.setItem('decisionScope', userDecisionScope);
      console.log('Decision scope saved:', userDecisionScope);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error saving decision scope:', error);
      Alert.alert('Error', 'Failed to save decision scope');
    }
  };

  return (
    <ThemedView style={{...styles.container, marginTop: 30}}>
      <Button onPress={() => router.back()}  title="Go to main page" />
      <ThemedText style={styles.welcome}>Optimize</ThemedText>
      <View style={{margin: 5}}>
        <TextInput
          style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            marginBottom: 10,
            paddingLeft: 5,
            color: 'white',
          }}
          placeholder="Enter encoded decision scope"
          placeholderTextColor="lightgray"
          onChangeText={setUserDecisionScope}
          value={userDecisionScope}
        />
        <Button title="Save Decision Scope" onPress={handleSaveDecisionScope} />
      </View>
      <View style={{margin: 5}}>
        <Button title="Extension Version" onPress={optimizeExtensionVersion} />
      </View>
      <View style={{margin: 5}}>
        <Button title="Update Propositions" onPress={updatePropositions} />
      </View>
      <View style={{margin: 5}}>
        <Button title="Get Propositions" onPress={getPropositions} />
      </View>
      <View style={{margin: 5}}>
        <Button
          title="Clear Cached Proposition"
          onPress={clearCachedProposition}
        />
      </View>
      <View style={{margin: 5}}>
        <Button
          title="Subscribe to Proposition Update"
          onPress={onPropositionUpdate}
        />
      </View>
      <ThemedText style={styles.welcome}>Personalized Offers</ThemedText>
      <RecyclerListView
        style={{width: width}}
        layoutProvider={layoutProvider}
        dataProvider={getContent()}
        rowRenderer={rowRenderer}
        onVisibleIndicesChanged={indicesChangeHandler}
      />
      {/* Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10}}>
            <Text style={{fontSize: 18, marginBottom: 10}}>Success!</Text>
            <Text>Your decision scope has been saved.</Text>
            <Button title="Close" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};
