import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushToken {
  data: string;
  type: 'expo' | 'ios' | 'android';
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private expoPushToken: string | null = null;
  private devicePushToken: string | null = null;

  private constructor() {}

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Register for push notifications (works on iOS, local only on Android)
   */
  async registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push notification permissions!');
        return null;
      }
      
      try {
        if (Platform.OS === 'ios') {
          // iOS: Get real Expo push token (works without Firebase)
          const expoTokenResponse = await Notifications.getExpoPushTokenAsync({
            projectId: 'a5b92550-3e0d-4481-8f93-afdd27f8901c', // Your EAS project ID
          });
          token = expoTokenResponse.data;
          console.log('iOS Expo push token:', token);
        } else {
          // Android: Use mock token (Firebase required for real tokens)
          console.log('Android: Using mock token (Firebase required for real push tokens)');
          token = `AndroidMockToken_${Date.now()}`;
        }
        
        this.expoPushToken = token;
        console.log('Successfully registered for notifications');
      } catch (error) {
        console.error('Error getting push token:', error);
        // Fallback to mock token
        token = `MockToken_${Date.now()}`;
        this.expoPushToken = token;
        console.log('Using mock token due to error:', token);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    return token;
  }

  /**
   * Get the current device push token (for AJO testing)
   */
  getDevicePushToken(): string | null {
    return this.devicePushToken;
  }

  /**
   * Get the current Expo push token (may be null without Firebase)
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Add a notification received listener
   */
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add a notification response received listener (when user taps notification)
   */
  addNotificationResponseReceivedListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(title: string, body: string, data?: any, trigger?: Notifications.NotificationTriggerInput) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: trigger || null, // null means show immediately
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

// Export a singleton instance
export const pushNotificationService = PushNotificationService.getInstance(); 