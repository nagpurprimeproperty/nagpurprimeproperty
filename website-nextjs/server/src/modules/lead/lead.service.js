import mongoose from 'mongoose';
import leadRepository from './lead.repository.js';
import propertyRepository from '../property/property.repository.js';
import purchasePlanRepository from '../subscription/purchasePlan.repository.js';
import userService from '../user/user.service.js';
import communicationService from '../communication/communication.service.js';
import Notification from '../notification/notification.model.js';
import env from '../../config/env.js';

const cleanText = (val, fallback = 'N/A') => {
  if (!val) return fallback;
  const str = String(val).replace(/[\r\n\t]+/g, ' ').trim();
  return str.length > 0 ? str : fallback;
};

const leadService = {

  /**
   * Helper to check broker subscription quota, deduct 1 lead access if available,
   * set isOpened boolean, trigger WhatsApp notification if quota available,
   * and send in-app + FCM push notification to the broker.
   */
  processLeadQuotaAndWhatsApp: async (leadPayload, propertyName) => {
    const rawBrokerId = leadPayload.brokerId;
    const brokerId = rawBrokerId?._id ? rawBrokerId._id : rawBrokerId;

    if (!brokerId) {
      leadPayload.isOpened = false;
      return leadPayload;
    }

    // Ensure leadPayload.brokerId is assigned pure ObjectId string/instance
    leadPayload.brokerId = brokerId;

    try {
      const customerName = leadPayload.customerName || 'Verified Buyer';
      const phone = leadPayload.phone || 'N/A';
      const propTitle = propertyName || leadPayload.propertyName || 'Property';

      const broker = await userService.getUser(brokerId).catch(() => null);
      const subscription = await purchasePlanRepository.getSubscriptionByUserId(brokerId);

      const isUnlimited = !!(subscription?.limits?.isLeadAccessUnlimited ?? subscription?.planId?.limits?.isLeadAccessUnlimited);
      const leadAccessCount = Number(subscription?.limits?.leadAccessCount ?? subscription?.planId?.limits?.leadAccessCount ?? 0);
      const leadsUnlocked = Number(subscription?.usage?.leadsUnlocked || 0);

      const hasQuotaLeft = !!subscription && (isUnlimited || leadAccessCount > leadsUnlocked);

      const maskPhone = (p) => (p && p.length >= 4 ? `***${p.slice(-4)}` : '***');

      // Deduct quota and send WhatsApp notification if quota available
      if (hasQuotaLeft) {
        leadPayload.isOpened = true;

        // Deduct 1 lead quota from broker subscription
        await purchasePlanRepository.markAsLeadOpened(subscription._id);

        // Send WhatsApp Notification to Broker if enabled & phone number exists
        if (env.WHATSAPP_ENABLED && broker?.mobile) {
          const templateId = env.WHATSAPP_LEAD_TEMPLATE_NAME || 'new_lead_notification';

          communicationService.sendWhatsApp({
            to: broker.mobile,
            body: `New Lead Alert!\n\nBuyer Name: ${customerName}\nContact Number: ${phone}\nInterested Property: ${propTitle}\n\nCheck your app for full details.`,
            templateId,
            metadata: {
              languageCode: env.WHATSAPP_LEAD_TEMPLATE_LANGUAGE || 'en_US',
              components: [
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: customerName },
                    { type: 'text', text: phone },
                    { type: 'text', text: propTitle },
                  ],
                },
              ],
              namedParameters: [
                { type: 'text', parameter_name: 'customer_name', text: customerName },
                { type: 'text', parameter_name: 'phone_number', text: phone },
                { type: 'text', parameter_name: 'property_name', text: propTitle },
              ],
            },
          }).then((res) => {
            console.log(`[WhatsApp Lead Alert Success] Message sent to broker (${maskPhone(broker.mobile)}), logId: ${res?.logId}`);
          }).catch((err) => console.error('[WhatsApp Lead Notification Error]:', err.message));
        }
      } else {
        leadPayload.isOpened = false;
        console.log(`[Lead Processing] No quota or active sub for broker ${brokerId}. Lead set to isOpened=false (Limit: ${leadAccessCount}, Unlocked: ${leadsUnlocked}).`);
      }

      // Always create In-App Notification & send FCM Push Notification to Broker
      const notifTitle = 'New Lead Received 🚀';
      const notifBody = hasQuotaLeft
        ? `New enquiry from ${customerName} for "${propTitle}". Details unlocked!`
        : `New enquiry from ${customerName} for "${propTitle}". Upgrade plan to view contact details.`;

      Notification.create({
        userId: brokerId,
        title: notifTitle,
        message: notifBody,
        targetRole: 'user',
        targetIds: [brokerId],
        userVisible: true,
        sendPush: true,
        type: 'info',
        data: {
          type: 'LEAD',
          propertyId: leadPayload.propertyId?.toString() || '',
        },
      }).catch((err) => console.error('[In-App Notification Error]:', err.message));

      if (broker?.fcmToken) {
        communicationService.sendPush({
          fcmToken: broker.fcmToken,
          title: notifTitle,
          body: notifBody,
          data: {
            type: 'LEAD',
            propertyId: leadPayload.propertyId?.toString() || '',
          },
        }).catch((err) => console.error('[FCM Push Notification Error]:', err.message));
      }

    } catch (err) {
      console.error('[Process Lead Quota & Notification Error]:', err.message);
      leadPayload.isOpened = false;
    }

    return leadPayload;
  },

  /**
   * Get lead by property and user (to check if already exists)
   */
  getLeadByPropertyAndUser: async (propertyId, userId) => {
    if (!propertyId || !userId) return null;
    const pId = mongoose.Types.ObjectId.isValid(propertyId) ? new mongoose.Types.ObjectId(propertyId) : null;
    const uId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
    
    const conditions = [];
    if (pId && uId) conditions.push({ propertyId: pId, userId: uId });
    if (pId) conditions.push({ propertyId: pId, userId: String(userId) });
    if (uId) conditions.push({ propertyId: String(propertyId), userId: uId });
    conditions.push({ propertyId: String(propertyId), userId: String(userId) });

    return leadRepository.findOne({ $or: conditions });
  },

  createLead: async (payload, session) => {
    const property = payload.propertyId ? await propertyRepository.findById(payload.propertyId) : null;
    const updatedPayload = await leadService.processLeadQuotaAndWhatsApp(payload, property?.title);
    return leadRepository.create(updatedPayload, session);
  },

  createLeadByOnlyFetchDataFromPropertyId: async (propertyId, user, session) => {
    const property = await propertyRepository.findById(propertyId);
    if (!property) throw { status: 404, message: 'Property not found' };

    const realPropertyId = property._id;
    const rawUserId = user?.id || user?._id;

    // Idempotent safeguard: if lead already exists, return it immediately without duplicate creation
    if (realPropertyId && rawUserId) {
      const existing = await leadService.getLeadByPropertyAndUser(realPropertyId, rawUserId);
      if (existing) {
        return existing;
      }
    }

    const rawBrokerId = property.brokerId?._id || property.brokerId;
    const brokerId = rawBrokerId && mongoose.Types.ObjectId.isValid(rawBrokerId)
      ? new mongoose.Types.ObjectId(rawBrokerId)
      : rawBrokerId;

    const userId = rawUserId && mongoose.Types.ObjectId.isValid(rawUserId)
      ? new mongoose.Types.ObjectId(rawUserId)
      : rawUserId;

    const payload = {
      propertyId: realPropertyId,
      userId,
      propertyType: property.propertyType || 'Residential',
      brokerId,
      area: property.location?.locality || property.location?.city || property.area || 'Nagpur',
      budget: String(property.pricing?.totalPrice || property.pricing?.startingPrice || property.pricing?.monthlyRent || property.totalPrice || property.price || 'Price on request'),
      customerName: user?.name || 'Verified Buyer',
      phone: user?.mobile || '9876543210',
      source: 'Website Lead',
    };

    const updatedPayload = await leadService.processLeadQuotaAndWhatsApp(payload, property.title);
    const lead = await leadRepository.create(updatedPayload, session);
    return lead;
  },
};

export default leadService;