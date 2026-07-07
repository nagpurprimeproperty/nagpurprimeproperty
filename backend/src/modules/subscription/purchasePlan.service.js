import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import env from '../../config/env.js';
import purchasePlanRepository from './purchasePlan.repository.js';
import planRepository from './plan.repository.js';
import userRepository from '../user/user.repository.js';
import User from '../user/user.model.js';
import logger from '../../utils/logger.js';

// ── Razorpay client ──────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Calculate subscription end date from plan duration info
 */
function calcEndDate(startDate, duration, durationUnit, isDurationUnlimited) {
  if (isDurationUnlimited) return null;
  const end = new Date(startDate);
  if (durationUnit === 'days')   end.setDate(end.getDate() + duration);
  if (durationUnit === 'months') end.setMonth(end.getMonth() + duration);
  if (durationUnit === 'years')  end.setFullYear(end.getFullYear() + duration);
  return end;
}

// ── Service ──────────────────────────────────────────────────────────────────

const purchasePlanService = {
  /**
   * Step 1 – Create a Razorpay order and a PENDING subscription record.
   * Called by: POST /api/v1/subscriptions/purchase/create-order
   */
  createOrder: async (userId, planId) => {
    // 1. Validate plan identifier
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      throw { status: 400, message: 'Invalid plan ID' };
    }

    // 2. Validate plan
    const plan = await planRepository.findById(planId);
    if (!plan) throw { status: 404, message: 'Subscription plan not found' };
    if (!plan.isActive) throw { status: 400, message: 'This plan is currently inactive' };

    // 2. Handle free plan separately (no Razorpay order needed)
    if (plan.isFree || plan.price === 0) {
      const startDate = new Date();
      const endDate   = calcEndDate(startDate, plan.duration, plan.durationUnit, plan.isDurationUnlimited);

      // Expire any previous active subscription
      await purchasePlanRepository.updateSubscription(
        { userId, status: 'Active' },
        { status: 'Cancelled' }
      );

      const subscription = await purchasePlanRepository.createSubscription({
        userId,
        planId: plan._id,
        planName: plan.name,
        startDate,
        endDate,
        status: 'Active',
        isFree: true,
        price: 0,
        duration: plan.duration,
        durationUnit: plan.durationUnit,
        isDurationUnlimited: plan.isDurationUnlimited,
        limits: plan.limits,
      });

      // ── Notify user + admin about free plan activation (fire-and-forget) ──
      import('../../services/notificationDelivery.service.js')
        .then(async ({ sendNotification, sendAdminNotification }) => {
          const user = await User.findById(userId).select('name mobile');
          const userName = user?.name || user?.mobile || 'A user';

          await sendNotification({
            userId,
            title: 'Plan Activated',
            message: `Your free plan "${plan.name}" has been activated successfully.`,
            type: 'PLAN_PURCHASED',
          });

          await sendAdminNotification({
            title: 'New Plan Purchase',
            message: `${userName} activated the free plan "${plan.name}".`,
            type: 'PLAN_PURCHASED',
            metadata: { userId: userId.toString(), planName: plan.name, price: 0, isFree: true },
          });
        })
        .catch((err) => console.error('[Notification] Free plan notification failed:', err.message));

      return { free: true, subscription };
    }

    // 3. Create a Razorpay payment link (preferred for simple checkout)
    const user = await userRepository.findById(userId);

    const receiptUserId = userId.toString().slice(-8);
    const referenceId = `sub_${receiptUserId}_${Date.now()}`;

    const paymentLinkPayload = {
      amount: Math.round(plan.price * 100),
      currency: 'INR',
      reference_id: referenceId,
      description: `Subscription: ${plan.name}`,
      customer: {
        name: user?.name || undefined,
        contact: user?.mobile || undefined,
        email: user?.email || undefined,
      },
      notify: { sms: !!user?.mobile, email: !!user?.email },
      notes: { userId: userId.toString(), planId: planId.toString() },
      callback_method: 'get',
    };

    const paymentLink = await razorpay.paymentLink.create(paymentLinkPayload);

    // 4. Create a PENDING subscription in DB
    const startDate = new Date();
    const endDate   = calcEndDate(startDate, plan.duration, plan.durationUnit, plan.isDurationUnlimited);

    const subscription = await purchasePlanRepository.createSubscription({
      userId,
      planId: plan._id,
      planName: plan.name,
      startDate,
      endDate,
      status: 'Pending',
      isFree: false,
      price: plan.price,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      isDurationUnlimited: plan.isDurationUnlimited,
      limits: plan.limits,
      paymentDetails: { paymentLinkId: paymentLink.id, paymentLinkUrl: paymentLink.short_url || paymentLink.long_url },
    });

    // 5. Create a PENDING transaction record
    await purchasePlanRepository.createTransaction({
      userId,
      amount: plan.price,
      status: 'pending',
      paymentDetails: { paymentLinkId: paymentLink.id },
    });

    return {
      free: false,
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.short_url || paymentLink.long_url,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      keyId: env.RAZORPAY_KEY_ID,
      subscriptionId: subscription._id,
      planName: plan.name,
    };
  },

  /**
   * Step 2 – Handle Razorpay webhook: payment.captured or payment.failed
   * Called by: POST /api/v1/subscriptions/purchase/webhook
   *
   * IMPORTANT: This route must receive the RAW body (Buffer) for signature verification.
   */
handleWebhook: async (rawBody, razorpaySignature) => {
    // 1. Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw { status: 400, message: 'Invalid webhook signature' };
    }

    const event = JSON.parse(rawBody.toString());
    const eventType = event.event;

    // 2. Only handle supported Razorpay payment events
    if (![
      'payment.captured',
      'payment.failed',
      'payment_link.paid',
      'payment_link.failed',
      'payment.link.paid',
      'payment.link.failed',
    ].includes(eventType)) {
      return { ignored: true };
    }

    const paymentEntity = event.payload?.payment?.entity;
    const paymentLinkEntity = event.payload?.payment_link?.entity;
    const paymentLinkPayments = paymentLinkEntity?.payments || paymentLinkEntity?.payment;
    const payment = paymentEntity || (Array.isArray(paymentLinkPayments) ? paymentLinkPayments[0] : paymentLinkPayments) || null;

    const orderId = payment?.order_id || null;
    const paymentLinkId = payment?.payment_link_id || paymentLinkEntity?.id || paymentLinkEntity?.payment_link_id || null;
    const lookupId = [paymentLinkId, orderId].find(Boolean);
    const paymentId = payment?.id || null;
    const method = payment?.method || null;
    const amountPaid = (payment?.amount || 0) / 100;

    logger.info(`Razorpay webhook event=${eventType} lookupId=${lookupId} paymentId=${paymentId}`);

    if (!lookupId) {
      logger.warn('Razorpay webhook missing lookup id', { eventType, payload: event.payload });
      return { ignored: true };
    }

    // 3. Find the pending subscription and transaction
    const identifiers = [orderId, paymentLinkId, paymentLinkEntity?.id].filter(Boolean);
    let [subscription, transaction] = await Promise.all([
      purchasePlanRepository.findByPaymentIdentifier(identifiers),
      purchasePlanRepository.findTransactionByPaymentIdentifier(identifiers),
    ]);

    if (!subscription && paymentId) {
      logger.info('Razorpay webhook fallback lookup using paymentId', { paymentId });
      try {
        const fetchedPayment = await razorpay.payments.fetch(paymentId);
        const fallbackPaymentLinkId = fetchedPayment?.payment_link_id || fetchedPayment?.payment_link?.id || null;
        const fallbackOrderId = fetchedPayment?.order_id || null;
        const fallbackIdentifiers = [fallbackPaymentLinkId, fallbackOrderId].filter(Boolean);

        if (fallbackIdentifiers.length) {
          logger.info('Razorpay webhook fetched payment details for fallback lookup', {
            paymentId,
            fallbackPaymentLinkId,
            fallbackOrderId,
          });

          [subscription, transaction] = await Promise.all([
            purchasePlanRepository.findByPaymentIdentifier(fallbackIdentifiers),
            purchasePlanRepository.findTransactionByPaymentIdentifier(fallbackIdentifiers),
          ]);
        }
      } catch (fallbackError) {
        logger.warn('Razorpay webhook fallback payment fetch failed', { paymentId, error: fallbackError?.message || fallbackError });
      }
    }

    if (!subscription) {
      logger.warn('Razorpay webhook did not find a matching subscription', { eventType, lookupId, paymentId, identifiers });
      return { ignored: true };
    }

    logger.info('Razorpay webhook matched subscription', {
      eventType,
      lookupId,
      paymentId,
      subscriptionId: subscription._id,
      transactionId: transaction?._id,
    });

    // 4. Avoid duplicate webhook processing
    if (subscription.status === 'Active' || subscription.status === 'Failed') {
      return { alreadyProcessed: true };
    }

    // 5. Use a MongoDB session for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    // ── FIX: include payment_link success events ─────────────────────────
    const SUCCESS_EVENTS = ['payment.captured', 'payment_link.paid', 'payment.link.paid'];

    try {
      if (SUCCESS_EVENTS.includes(eventType)) {
        // ── Payment successful ───────────────────────────────────────
        await purchasePlanRepository.updateSubscription(
          { userId: subscription.userId, status: 'Active', _id: { $ne: subscription._id } },
          { status: 'Cancelled' }
        );

        await purchasePlanRepository.updateSubscription(subscription._id, {
          status: 'Active',
          'paymentDetails.paymentId': paymentId,
          'paymentDetails.amountPaid': amountPaid,
          'paymentDetails.method': method,
        });

        if (transaction) {
          await purchasePlanRepository.updateTransaction(transaction._id, {
            status: 'success',
            'paymentDetails.paymentId': paymentId,
            'paymentDetails.amountPaid': amountPaid,
            'paymentDetails.method': method,
          });
        }
      } else {
        // ── Payment failed ───────────────────────────────────────────
        await purchasePlanRepository.updateSubscription(subscription._id, {
          status: 'Failed',
          'paymentDetails.paymentId': paymentId,
        });

        if (transaction) {
          await purchasePlanRepository.updateTransaction(transaction._id, {
            status: 'failed',
            'paymentDetails.paymentId': paymentId,
          });
        }
      }

      await session.commitTransaction();

      // ── PLAN_PURCHASED notification to user + admin (fire-and-forget) ─────
      if (SUCCESS_EVENTS.includes(eventType)) {
        import('../../services/notificationDelivery.service.js')
          .then(async ({ sendNotification, sendAdminNotification }) => {
            const user = await User.findById(subscription.userId).select('name mobile');
            const userName = user?.name || user?.mobile || 'A user';

            await sendNotification({
              userId: subscription.userId,
              title: 'Plan Activated',
              message: `Your plan "${subscription.planName}" has been activated successfully.`,
              type: 'PLAN_PURCHASED',
            });

            await sendAdminNotification({
              title: 'New Plan Purchase',
              message: `${userName} purchased the "${subscription.planName}" plan for ₹${amountPaid}.`,
              type: 'PLAN_PURCHASED',
              metadata: {
                userId: subscription.userId.toString(),
                planName: subscription.planName,
                price: amountPaid,
                paymentId,
                isFree: false,
              },
            });
          })
          .catch((err) => console.error('[Notification] PLAN_PURCHASED failed:', err.message));
      }
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    return { processed: true, event: eventType };
  },

  /**
   * Get the currently active subscription for a user.
   */
  getMySubscription: async (userId) => {
    const subscription = await purchasePlanRepository.findActiveByUser(userId);
    return subscription || null;
  },

  /**
   * Get full subscription purchase history for a user.
   */
  getMyHistory: async (userId, query) => {
    return purchasePlanRepository.findAllByUser(userId, query);
  },

  /**
   * Get a specific subscription by ID (must belong to the requesting user).
   */
  getSubscriptionById: async (userId, subscriptionId) => {
    const subscription = await purchasePlanRepository.findSubscriptionById(subscriptionId);
    if (!subscription) throw { status: 404, message: 'Subscription not found' };
    if (subscription.userId.toString() !== userId.toString()) {
      throw { status: 403, message: 'Access denied' };
    }
    return subscription;
  },
};

export default purchasePlanService;
