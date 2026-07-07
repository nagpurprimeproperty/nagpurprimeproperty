import { Platform } from 'react-native';
import Constants from 'expo-constants';

declare var require: any;

const isExpoGo = 
  Constants.executionEnvironment === 'storeClient' || 
  Constants.appOwnership === 'expo';

/**
 * Lazy loads expo-notifications to prevent errors/warnings on initialization 
 * inside Expo Go in SDK 53+.
 */
const getNotificationsModule = () => {
  if (isExpoGo) {
    return null;
  }
  try {
    return require('expo-notifications');
  } catch (e) {
    if (__DEV__) {
      console.warn('[PushNotifications] Failed to load expo-notifications module:', e);
    }
    return null;
  }
};

/**
 * Requests notification permissions and returns the FCM/APNs device token.
 *
 * Returns null if:
 *  - Permission is denied
 *  - Running inside Expo Go (remote push notifications are unsupported in Expo Go SDK 53)
 *  - Running on simulator/emulator without push support
 *  - Any error occurs
 *
 * NOTE: This is an Expo React Native app — we use expo-notifications, NOT the
 * web Firebase SDK. No service worker, no VAPID key needed.
 */
export const getDevicePushToken = async (): Promise<string | null> => {
  if (__DEV__) {
    console.log('[PushNotifications] getDevicePushToken called.');
    console.log('[PushNotifications] executionEnvironment:', Constants.executionEnvironment);
    console.log('[PushNotifications] isExpoGo:', isExpoGo);
  }

  const Notifications = getNotificationsModule();
  if (!Notifications) {
    if (__DEV__) {
      console.warn('[PushNotifications] Push notifications are not supported in Expo Go.');
    }
    return null;
  }
  try {
    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      if (__DEV__) {
        console.warn('[PushNotifications] Permission denied');
      }
      return null;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Get the native device push token (FCM on Android, APNs on iOS)
    const tokenData = await Notifications.getDevicePushTokenAsync();
    return tokenData.data ?? null;
  } catch (err: any) {
    if (__DEV__) {
      console.error('[PushNotifications] Failed to get push token:', err?.message ?? err);
    }
    return null;
  }
};

/**
 * Configure foreground notification handling behaviour.
 * Call once at app startup (e.g. in _layout.tsx).
 */
export const configureNotificationHandler = () => {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

/**
 * Sets up a listener for when the user taps a push notification.
 * Navigates to the notification screen.
 * Returns a cleanup function to remove the listener.
 */
export const setupNotificationResponseListener = (): (() => void) => {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return () => {};
  }

  const subscription = Notifications.addNotificationResponseReceivedListener(
    (_response: any) => {
      // Navigate to the notification screen when user taps a push notification
      const { router } = require('expo-router');
      router.push('/notification');
    }
  );

  return () => subscription.remove();
};

