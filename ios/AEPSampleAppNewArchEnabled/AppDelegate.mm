/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

#import "AppDelegate.h"
#import <AEPCore/AEPCore.h>
#import <AEPIdentity/AEPIdentity.h>
#import <AEPLifecycle/AEPLifecycle.h>
#import <AEPSignal/AEPSignal.h>
#import <AEPEdge/AEPEdge.h>
#import <AEPEdgeIdentity/AEPEdgeIdentity.h>
#import <AEPEdgeConsent/AEPEdgeConsent.h>
#import <AEPMessaging/AEPMessaging.h>
#import <AEPOptimize/AEPOptimize.h>
#import <AEPPlaces/AEPPlaces.h>
#import <AEPAssurance/AEPAssurance.h>
#import <AEPUserProfile/AEPUserProfile.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate {
  UIApplicationState appState;
}

+ (void)setAdobeAppId:(NSString *)appId {
    if (appId && appId.length > 0) {
        [AEPMobileCore configureWithAppId:appId];
        
        // Register extensions
        [AEPMobileCore registerExtensions:@[
            [AEPIdentity class],
            [AEPLifecycle class],
            [AEPSignal class],
            [AEPEdge class],
            [AEPEdgeIdentity class],
            [AEPEdgeConsent class],
            [AEPMessaging class],
            [AEPOptimize class],
            [AEPPlaces class],
            [AEPAssurance class],
            [AEPUserProfile class]
        ] completion:^{
            [AEPMobileCore lifecycleStart:nil];
        }];
    }
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"AEPSampleAppNewArchEnabled";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Initialize with a default or empty app ID
  [AEPMobileCore configureWithAppId:@""];
  
  // Register extensions
  [AEPMobileCore registerExtensions:@[
    [AEPIdentity class],
    [AEPLifecycle class],
    [AEPSignal class],
    [AEPEdge class],
    [AEPEdgeIdentity class],
    [AEPEdgeConsent class],
    [AEPMessaging class],
    [AEPOptimize class],
    [AEPPlaces class],
    [AEPAssurance class],
    [AEPUserProfile class]
  ] completion:^{
    [AEPMobileCore lifecycleStart:nil];
  }];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  return [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  return [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}


// Setup for Lifecycle Start when entering foreground
- (void)applicationWillEnterForeground:(UIApplication *)application{
  appState = application.applicationState;
  [AEPMobileCore lifecycleStart];
}

// Setup for Lifecycle Start when entering background
- (void)applicationDidEnterBackground:(UIApplication *)application{
  appState = application.applicationState;
  [AEPMobileCore lifecyclePause];
}

@end
