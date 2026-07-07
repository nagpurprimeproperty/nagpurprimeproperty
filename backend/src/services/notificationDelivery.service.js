import Notification from '../modules/notification/notification.model.js';
import User from '../modules/user/user.model.js';
import { getMessaging } from '../config/firebase.js';
import { getIO } from '../socket.js';

/**
 * Central notification delivery service.
 *
 * 1. Persists notification to MongoDB
 * 2. Emits real-time event via Socket.IO
 * 3. Sends FCM push notification with retry
 *
 * Socket and FCM failures are isolated — one does not break the other.
 */
const sendNotification = async ({ userId, title, message, type, metadata = {} }) => {
  // ── 1. Persist to DB ───────────────────────────────────────────────────────
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    data: metadata,
    // Keep existing broadcast fields at their defaults
    targetRole: 'user',
    targetIds: [userId],
    userVisible: true,
    status: 'sent',
    deliveredByBackend: true,
  });

  // ── 2. Emit via Socket.IO ──────────────────────────────────────────────────
  try {
    const io = getIO();
    const userRoom = userId.toString();

    io.to(userRoom).emit('notification', notification);

    const unreadCount = await Notification.countDocuments({
      userId,
      readBy: { $not: { $elemMatch: { readerId: userId, readerType: 'user' } } },
    });
    io.to(userRoom).emit('notification_count', { count: unreadCount });
  } catch (socketErr) {
    console.error('[Socket] emit failed:', socketErr.message);
    // Non-fatal — continue to FCM
  }

  // ── 3. FCM push ────────────────────────────────────────────────────────────
  try {
    const user = await User.findById(userId).select('fcmToken');
    if (user?.fcmToken) {
      await sendFCMWithRetry(user.fcmToken, { title, message, type, userId });
    }
  } catch (fcmErr) {
    console.error('[FCM] delivery failed:', fcmErr.message);
    // Non-fatal
  }

  return notification;
};

/**
 * Send an FCM message with exponential backoff retry.
 * Clears invalid tokens automatically.
 */
const sendFCMWithRetry = async (token, { title, message, type, userId }, retries = 3) => {
  const UNRECOVERABLE = [
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const messaging = getMessaging();
      await messaging.send({
        token,
        notification: { title, body: message },
        data: { type: String(type) },
        android: { priority: 'high' },
        apns: { payload: { aps: { contentAvailable: true, badge: 1 } } },
      });
      return; // success
    } catch (err) {
      const code = err?.code || err?.errorInfo?.code || '';

      if (UNRECOVERABLE.some((e) => code.includes(e.split('/')[1]))) {
        console.warn(`[FCM] Invalid token for user ${userId} — clearing.`);
        await User.findByIdAndUpdate(userId, { fcmToken: null });
        return;
      }

      if (attempt === retries) {
        console.error(`[FCM] Failed after ${retries} attempts:`, err.message);
      } else {
        const delay = 1000 * attempt; // 1s, 2s, 3s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
};

/**
 * Send a notification targeted at admins.
 *
 * Persists to MongoDB with targetRole='admin'. The admin panel reads
 * these via its own API and receives real-time updates via its Socket.IO
 * /admin namespace (powered by the polling watcher or change stream).
 *
 * No FCM push is sent — admin notifications are delivered via the
 * web-based admin dashboard.
 */
const sendAdminNotification = async ({ title, message, type, metadata = {} }) => {
  try {
    const notification = await Notification.create({
      title,
      message,
      type,
      data: metadata,
      targetRole: 'admin',
      targetIds: [],
      userVisible: false,
      status: 'sent',
      deliveredByBackend: true, // No need for the polling watcher to re-process
    });

    console.log(`[AdminNotif] Created: "${title}" (ID: ${notification._id})`);
    return notification;
  } catch (err) {
    console.error('[AdminNotif] Failed to create admin notification:', err.message);
    // Non-fatal — don't break the caller's flow
  }
};

export { sendNotification, sendAdminNotification };

