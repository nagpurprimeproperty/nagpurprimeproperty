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
 * Requests notification permissions and returns the Expo Push Token.
 *
 * ── WHY Expo Push Token (not getDevicePushTokenAsync) ──────────────────────
 *  getDevicePushTokenAsync() returns:
 *    Android → FCM token    ✅ Works with FCM backend
 *    iOS     → APNs token   ❌ FCM backend CANNOT use this — wrong format
 *
 *  getExpoPushTokenAsync() returns:
 *    Both platforms → ExponentPushToken[...]  ✅
 *    Expo's gateway routes:  iOS → APNs,  Android → FCM  internally.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * ── BACKEND REQUIREMENT ────────────────────────────────────────────────────
 *  Backend must send notifications via Expo's push API (not raw FCM):
 *    POST https://exp.host/--/api/v2/push/send
 *    Body: { to: "ExponentPushToken[...]", title: "...", body: "..." }
 *
 *  Node.js backend — install: npm i expo-server-sdk
 *    const { Expo } = require('expo-server-sdk');
 *    const expo = new Expo();
 *    await expo.sendPushNotificationsAsync([{ to: pushToken, title, body }]);
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Returns null if:
 *  - Permission denied
 *  - Running inside Expo Go
 *  - EAS projectId not found in config
 *  - Any error occurs
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
      console.warn('[PushNotifications] Push notifications not supported in Expo Go.');
    }
    return null;
  }

  try {
    // ── Step 1: Request permission ──────────────────────────────────────────
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        // iOS: explicitly request all alert types so system permission prompt is complete
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
          provideAppNotificationSettings: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      if (__DEV__) {
        console.warn('[PushNotifications] Permission denied — status:', finalStatus);
      }
      return null;
    }

    // ── Step 2: Android — create default notification channel ───────────────
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // ── Step 3: Get Expo Push Token ─────────────────────────────────────────
    // Works on iOS (APNs) and Android (FCM) via Expo's push gateway.
    // Requires EAS projectId — automatically present in EAS builds.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;

    if (!projectId) {
      if (__DEV__) {
        console.warn(
          '[PushNotifications] EAS projectId not found. ' +
          'Ensure extra.eas.projectId is set in app.config.js.',
        );
      }
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });

    if (__DEV__) {
      console.log('[PushNotifications] Expo Push Token:', tokenData.data);
    }

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
      const { router } = require('expo-router');
      router.push('/notification');
    }
  );

  return () => subscription.remove();
};

