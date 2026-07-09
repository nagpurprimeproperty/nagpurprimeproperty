/**
 * src/features/notification/index.ts
 *
 * Public API for the notification feature slice.
 */

// Hooks
export {
  useNotifications,
  useUnreadCount,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from './hooks/useNotification';

// Keys
export { notificationKeys } from './keys/notificationKeys';

// Service types
export type {
  NotificationApiItem,
  NotificationListResponse,
  FetchNotificationsParams,
} from './services/notificationService';
