import Notification from '../modules/notification/notification.model.js';
import User from '../modules/user/user.model.js';
import { getIO } from '../socket.js';
import { getMessaging } from '../config/firebase.js';

/**
 * Polling-based Notification Watcher.
 *
 * Periodically checks MongoDB for notifications that were created by
 * external systems (e.g. the Next.js admin panel) and not yet delivered
 * by this Express backend. Delivers them via Socket.IO (real-time) and
 * Firebase FCM (push notification).
 *
 * Works with ANY MongoDB topology — standalone, replica set, or Atlas.
 */

const POLL_INTERVAL_MS = 3000; // Check every 3 seconds
let pollTimer = null;

export const startNotificationWatch = () => {
  console.log(`📡 Notification Polling Watcher starting (every ${POLL_INTERVAL_MS / 1000}s)…`);

  // Run the first poll immediately, then schedule recurring polls
  pollForNewNotifications();

  pollTimer = setInterval(pollForNewNotifications, POLL_INTERVAL_MS);

  console.log('📡 Notification Polling Watcher started.');
};

/**
 * Stop the polling watcher (used during graceful shutdown).
 */
export const stopNotificationWatch = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
    console.log('📡 Notification Polling Watcher stopped.');
  }
};

/**
 * Single poll cycle: find all undelivered notifications and process them.
 */
let isProcessing = false;

const pollForNewNotifications = async () => {
  // Guard against overlapping polls if a previous cycle is still running
  if (isProcessing) return;
  isProcessing = true;

  try {
    // Find notifications NOT yet delivered by this backend
    // Only look at notifications from the last 5 minutes to prevent
    // flooding users with old notifications on first startup.
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const pending = await Notification.find({
      $or: [
        { deliveredByBackend: false },
        { deliveredByBackend: { $exists: false } },
      ],
      createdAt: { $gte: fiveMinutesAgo },
    })
      .sort({ createdAt: 1 }) // oldest first
      .limit(50) // cap per cycle to prevent overload
      .lean();

    if (pending.length === 0) return;

    console.log(`[Watcher] Found ${pending.length} undelivered notification(s). Processing…`);

    for (const notification of pending) {
      try {
        await deliverNotification(notification);
      } catch (err) {
        console.error(`[Watcher] Failed to deliver notification ${notification._id}:`, err.message);
      }
    }
  } catch (err) {
    // Non-fatal — log and continue polling
    console.error('[Watcher] Poll cycle error:', err.message);
  } finally {
    isProcessing = false;
  }
};

/**
 * Deliver a single notification via Socket.IO and (optionally) FCM push.
 */
const deliverNotification = async (notification) => {
  const io = getIO();
  const { _id, userId, targetIds, targetRole, title, message, type, sendPush } = notification;

  console.log(`[Watcher] ──────────────────────────────────────────────────`);
  console.log(`[Watcher] Delivering: "${title}" (ID: ${_id})`);
  console.log(`[Watcher]   targetRole=${targetRole} | sendPush=${!!sendPush} | userId=${userId || '(none)'} | targetIds=${targetIds?.length || 0}`);

  // ── Scenario 1: Targeted single user ─────────────────────────────────────
  if (userId) {
    const userRoom = userId.toString();

    // Socket.IO real-time delivery
    io.to(userRoom).emit('notification', notification);

    const unreadCount = await Notification.getUserUnreadCount(userId);
    io.to(userRoom).emit('notification_count', { count: unreadCount });

    // FCM push (only if sendPush is true)
    if (sendPush) {
      const user = await User.findById(userId).select('fcmToken');
      console.log(`[Watcher] 🔍 User ${userId} fcmToken: ${user?.fcmToken ? `"${user.fcmToken.slice(0, 30)}..."` : '❌ NULL/MISSING'}`);
      if (user?.fcmToken) {
        await sendFCM(user.fcmToken, { title, message, type, userId });
      } else {
        console.warn(`[Watcher] ⚠️ Skipping push for user ${userId} — no fcmToken in DB`);
      }
    }
  }
  // ── Scenario 2: Multiple targeted users ──────────────────────────────────
  else if (targetIds && targetIds.length > 0) {
    console.log(`[Watcher] 📋 Sending to ${targetIds.length} targeted user(s)`);
    for (const targetId of targetIds) {
      const userRoom = targetId.toString();

      io.to(userRoom).emit('notification', notification);

      const unreadCount = await Notification.getUserUnreadCount(targetId);
      io.to(userRoom).emit('notification_count', { count: unreadCount });

      if (sendPush) {
        const user = await User.findById(targetId).select('fcmToken');
        console.log(`[Watcher] 🔍 User ${targetId} fcmToken: ${user?.fcmToken ? `"${user.fcmToken.slice(0, 30)}..."` : '❌ NULL/MISSING'}`);
        if (user?.fcmToken) {
          await sendFCM(user.fcmToken, { title, message, type, userId: targetId });
        } else {
          console.warn(`[Watcher] ⚠️ Skipping push for user ${targetId} — no fcmToken in DB`);
        }
      }
    }
  }
  // ── Scenario 3: Broadcast (user or all) ──────────────────────────────────
  else if (targetRole === 'user' || targetRole === 'all') {
    // Socket.IO broadcast to all connected mobile app users
    io.emit('notification', notification);

    // FCM push to ALL users with tokens
    if (sendPush) {
      const users = await User.find({
        fcmToken: { $ne: null, $exists: true },
        isActive: true,
        isDeleted: { $ne: true },
      }).select('_id fcmToken');

      console.log(`[Watcher] 📢 Broadcasting push to ${users.length} device(s)`);
      if (users.length === 0) {
        console.warn(`[Watcher] ⚠️ NO users have fcmToken in DB — push will not be sent to anyone!`);
      } else {
        users.forEach((u, i) => {
          console.log(`[Watcher]   ${i + 1}. User ${u._id} → token: "${u.fcmToken.slice(0, 35)}..."`);
        });
      }

      // Send in parallel batches of 10 to avoid overwhelming FCM
      const BATCH_SIZE = 10;
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
          batch.map((user) =>
            sendFCM(user.fcmToken, { title, message, type, userId: user._id })
          )
        );
      }
    } else {
      console.log(`[Watcher] ℹ️ sendPush is false — skipping FCM push`);
    }
  }

  // Mark as delivered so we don't process it again
  await Notification.findByIdAndUpdate(_id, {
    deliveredByBackend: true,
    pushSent: sendPush ? true : false,
  });

  console.log(`[Watcher] ✅ Delivered: "${title}" (ID: ${_id})`);
  console.log(`[Watcher] ──────────────────────────────────────────────────`);
};

/**
 * Send an individual push notification.
 * Supports both Expo Push Tokens and native FCM tokens.
 * Automatically clears invalid/expired device tokens.
 */
const sendFCM = async (token, { title, message, type, userId }) => {
  // ── Detect token type ──────────────────────────────────────────────────────
  const isExpoToken =
    typeof token === 'string' &&
    (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['));

  console.log(`[Watcher:Push] 🔑 Token type: ${isExpoToken ? 'EXPO PUSH TOKEN' : 'NATIVE FCM TOKEN'} | User: ${userId}`);
  console.log(`[Watcher:Push]   Token value: "${token.slice(0, 40)}..."`);

  // ── Route 1: Expo Push Token → send via Expo Push API ──────────────────────
  if (isExpoToken) {
    console.log(`[Watcher:Push] 📤 Sending via Expo Push API (exp.host)...`);
    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            to: token,
            sound: 'default',
            title,
            body: message,
            data: { type: String(type || 'info'), userId: String(userId) },
            priority: 'high',
            _displayInForeground: true,
          },
        ]),
      });
      const data = await res.json();
      console.log(`[Watcher:Push] 📬 Expo API response:`, JSON.stringify(data));

      if (data?.data?.[0]?.status === 'error') {
        const errDetails = data.data[0];
        if (errDetails.details?.error === 'DeviceNotRegistered') {
          console.warn(`[Watcher:Push] ❌ DeviceNotRegistered for user ${userId} — clearing token from DB.`);
          await User.findByIdAndUpdate(userId, { fcmToken: null });
        } else {
          console.error(`[Watcher:Push] ❌ Expo error: ${errDetails.message || errDetails.details?.error}`);
        }
      } else {
        console.log(`[Watcher:Push] ✅ Expo push sent successfully to user ${userId}`);
      }
    } catch (expoErr) {
      console.error(`[Watcher:Push] ❌ Expo Push API request failed:`, expoErr.message);
    }
    return;
  }

  // ── Route 2: Native FCM Token → send via Firebase Admin SDK ────────────────
  console.log(`[Watcher:Push] 📤 Sending via Firebase Admin SDK (FCM)...`);
  try {
    const messaging = getMessaging();
    await messaging.send({
      token,
      notification: { title, body: message },
      data: { type: String(type || 'info') },
      android: { 
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default'
        }
      },
      apns: { payload: { aps: { contentAvailable: true, badge: 1, sound: 'default' } } },
    });
    console.log(`[Watcher:Push] ✅ FCM push sent successfully to user ${userId}`);
  } catch (err) {
    const code = err?.code || err?.errorInfo?.code || '';
    console.error(`[Watcher:Push] ❌ FCM send FAILED for user ${userId}`);
    console.error(`[Watcher:Push]   Error code: ${code}`);
    console.error(`[Watcher:Push]   Error message: ${err.message}`);
    if (
      code.includes('registration-token-not-registered') ||
      code.includes('invalid-registration-token')
    ) {
      console.warn(`[Watcher:Push] 🗑️ Token is invalid/expired — clearing from DB for user ${userId}`);
      await User.findByIdAndUpdate(userId, { fcmToken: null });
    }
  }
};
