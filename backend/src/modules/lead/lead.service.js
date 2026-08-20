import mongoose from 'mongoose';
import leadRepository from './lead.repository.js';
import propertyRepository from '../property/property.repository.js';
import purchasePlanRepository from '../subscription/purchasePlan.repository.js';
import userService from '../user/user.service.js';
import communicationService from '../communication/communication.service.js';
import Notification from '../notification/notification.model.js';
import env from '../../config/env.js';

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
      const broker = await userService.getUser(brokerId).catch(() => null);
      const subscription = await purchasePlanRepository.getSubscriptionByUserId(brokerId);

      const isUnlimited = !!(subscription?.limits?.isLeadAccessUnlimited ?? subscription?.planId?.limits?.isLeadAccessUnlimited);
      const leadAccessCount = Number(subscription?.limits?.leadAccessCount ?? subscription?.planId?.limits?.leadAccessCount ?? 0);
      const leadsUnlocked = Number(subscription?.usage?.leadsUnlocked || 0);

      const hasQuotaLeft = !!subscription && (isUnlimited || leadAccessCount > leadsUnlocked);

      console.log(`[Lead Processing] BrokerId: ${brokerId} | HasBroker: ${!!broker} | Mobile: ${broker?.mobile} | HasSub: ${!!subscription} | isUnlimited: ${isUnlimited} | Limit: ${leadAccessCount} | Unlocked: ${leadsUnlocked} | QuotaLeft: ${hasQuotaLeft} | WA Enabled: ${env.WHATSAPP_ENABLED}`);

      const customerName = leadPayload.customerName || 'Customer';
      const phone = leadPayload.phone || 'N/A';
      const propTitle = propertyName || 'Property';

      if (hasQuotaLeft) {
        leadPayload.isOpened = true;

        // Deduct 1 lead quota from broker subscription
        await purchasePlanRepository.markAsLeadOpened(subscription._id);

        // Send WhatsApp Notification to Broker if enabled & phone number exists
        if (env.WHATSAPP_ENABLED && broker?.mobile) {
          const templateId = env.WHATSAPP_LEAD_TEMPLATE_NAME || 'new_lead_notification';

          console.log(`[WhatsApp Lead Alert] Triggering WhatsApp message to broker mobile: ${broker.mobile}`);

          communicationService.sendWhatsApp({
            to: broker.mobile,
            body: `New Lead Alert!\n\nBuyer Name: ${customerName}\nContact Number: ${phone}\nInterested Property: ${propTitle}\n\nCheck your app for full details.`,
            templateId,
            metadata: {
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
            },
          }).then((res) => {
            console.log(`[WhatsApp Lead Alert Success] Message sent to ${broker.mobile}, logId: ${res?.logId}`);
          }).catch((err) => console.error('[WhatsApp Lead Notification Error]:', err.message));
        } else {
          console.log(`[WhatsApp Lead Alert Skipped] WHATSAPP_ENABLED: ${env.WHATSAPP_ENABLED}, brokerMobile: ${broker?.mobile}`);
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
   * Get paginated list with server-side filtering
   */
  listLeads: async (brokerId, { page = 1, limit = 10 } = {}) => {
    return leadRepository.findAll({ brokerId, page, limit });
  },

  /**
   * Get a single lead by ID
   */
  getLead: async (id, brokerId) => {
    const subscription = await purchasePlanRepository.getSubscriptionByUserId(brokerId);
    const lead = await leadRepository.findById(id, brokerId);
  
    if (!lead) throw { status: 404, message: 'Lead not found' };

    if (!lead.isOpened) {
      if (!subscription) {
        throw { status: 403, message: 'Upgrade to a premium plan to view lead details' };
      }

      const isUnlimited = !!(subscription?.limits?.isLeadAccessUnlimited ?? subscription?.planId?.limits?.isLeadAccessUnlimited);
      const leadAccessCount = Number(subscription?.limits?.leadAccessCount ?? subscription?.planId?.limits?.leadAccessCount ?? 0);
      const leadsUnlocked = Number(subscription?.usage?.leadsUnlocked || 0);

      if (!isUnlimited && leadAccessCount <= leadsUnlocked) {
        throw { status: 403, message: 'Your lead access limit has been reached' };
      }
      await purchasePlanRepository.markAsLeadOpened(subscription._id);
      await leadRepository.markAsOpened(id);
      lead.isOpened = true;
    }
    return lead;
  },

  /**
   * Get lead by property and user (to check if already exists)
   */
  getLeadByPropertyAndUser: async (propertyId, userId) => {
    if (!propertyId || !userId) return null;
    const pId = mongoose.Types.ObjectId.isValid(propertyId) ? new mongoose.Types.ObjectId(propertyId) : propertyId;
    const uId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    return leadRepository.findOne({ propertyId: pId, userId: uId });
  },

  createLead: async (payload, session) => {
    const property = payload.propertyId ? await propertyRepository.findById(payload.propertyId) : null;
    const updatedPayload = await leadService.processLeadQuotaAndWhatsApp(payload, property?.title);
    return leadRepository.create(updatedPayload, session);
  },

  createLeadByOnlyFetchDataFromPropertyId: async (propertyId, user, session) => {
    const property = await propertyRepository.findById(propertyId);
    if (!property) throw { status: 404, message: 'Property not found' };
   
    const payload = {
      propertyId,
      userId: user.id,
      propertyType: property.propertyType,
      brokerId: property.brokerId,
      area: property.location?.locality,
      budget: property.pricing?.totalPrice || property?.pricing?.monthlyRent,
      customerName: user?.name,
      phone: user?.mobile,
    };

    const updatedPayload = await leadService.processLeadQuotaAndWhatsApp(payload, property.title);
    const lead = await leadRepository.create(updatedPayload, session);
    return lead;
  },

  /**
   * Update lead status
   */
  updateStatus: async (id, status, brokerId) => {
    const lead = await leadRepository.updateStatus(id, status, brokerId);    
    return lead;
  },
};

export default leadService;