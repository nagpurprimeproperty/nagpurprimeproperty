import cron from 'node-cron';
import Subscription from '../modules/subscription/purchaseSubscription.model.js';
import User from '../modules/user/user.model.js';
import { sendNotification, sendAdminNotification } from '../services/notificationDelivery.service.js';

/**
 * Runs daily at midnight.
 * Sends:
 *  - "Plan Expiring" reminder 7 days before expiry (once per subscription)
 *  - "Plan Expired" notification after expiry date (once per subscription)
 *
 * Both user and admin receive notifications for each event.
 */
const startSubscriptionNotificationJob = () => {
  // Run daily at 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running subscription notification job…');

    try {
      await sendExpiryReminders();
      await sendExpiredNotifications();
    } catch (err) {
      console.error('[CRON] Subscription notification job error:', err.message);
    }
  });

  console.log('[CRON] Subscription notification job scheduled (daily 00:00)');
};

// ── Expiry reminder (7 days before) ──────────────────────────────────────────

async function sendExpiryReminders() {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const expiringSubs = await Subscription.find({
    endDate: {
      $gte: now,
      $lte: sevenDaysFromNow,
    },
    status: 'Active',
    expiryReminderSent: false,
  });

  console.log(`[CRON] Found ${expiringSubs.length} subscription(s) expiring soon`);

  for (const sub of expiringSubs) {
    try {
      const user = await User.findById(sub.userId).select('name mobile');
      const userName = user?.name || user?.mobile || 'A user';
      const daysLeft = Math.ceil((sub.endDate - now) / (1000 * 60 * 60 * 24));

      // Notify the user
      await sendNotification({
        userId: sub.userId,
        title: 'Plan Expiring Soon',
        message: `Your "${sub.planName}" plan will expire in ${daysLeft} days. Renew now to continue receiving leads and premium benefits.`,
        type: 'PLAN_EXPIRING',
      });

      // Notify admins
      await sendAdminNotification({
        title: 'User Plan Expiring Soon',
        message: `${userName}'s "${sub.planName}" plan will expire in ${daysLeft} days.`,
        type: 'PLAN_EXPIRING',
        metadata: {
          userId: sub.userId.toString(),
          planName: sub.planName,
          endDate: sub.endDate.toISOString(),
          daysLeft,
        },
      });

      sub.expiryReminderSent = true;
      await sub.save();
    } catch (err) {
      console.error(`[CRON] Failed to send expiry reminder for sub ${sub._id}:`, err.message);
    }
  }
}

import purchasePlanService from '../modules/subscription/purchasePlan.service.js';

// ── Expired plan notification & downgrade ─────────────────────────────────────

async function sendExpiredNotifications() {
  const now = new Date();

  // Find all active subscriptions whose end date has passed
  const expiredSubs = await Subscription.find({
    endDate: { $lte: now },
    isDurationUnlimited: false,
    status: 'Active',
  });

  console.log(`[CRON] Found ${expiredSubs.length} active subscription(s) ready for expiration & downgrade`);

  for (const sub of expiredSubs) {
    try {
      await purchasePlanService.handleExpiredSubscription(sub);
      console.log(`[CRON] Successfully expired and downgraded subscription ${sub._id} for user ${sub.userId}`);
    } catch (err) {
      console.error(`[CRON] Failed to process expired subscription ${sub._id}:`, err.message);
    }
  }
}

export { startSubscriptionNotificationJob };
