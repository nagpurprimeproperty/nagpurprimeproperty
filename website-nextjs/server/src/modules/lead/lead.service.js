import leadRepository from './lead.repository.js';
import propertyRepository from '../property/property.repository.js';
import purchasePlanRepository from '../subscription/purchasePlan.repository.js';
import userService from '../user/user.service.js';
import communicationService from '../communication/communication.service.js';
import env from '../../config/env.js';

const leadService = {

  /**
   * Helper to check broker subscription quota, deduct 1 lead access if available,
   * set isOpened boolean, and trigger WhatsApp notification if quota available.
   */
  processLeadQuotaAndWhatsApp: async (leadPayload, propertyName) => {
    const brokerId = leadPayload.brokerId;
    if (!brokerId) {
      leadPayload.isOpened = false;
      return leadPayload;
    }

    try {
      const broker = await userService.getUser(brokerId).catch(() => null);
      const subscription = await purchasePlanRepository.getSubscriptionByUserId(brokerId);

      const isUnlimited = !!subscription?.limits?.isLeadAccessUnlimited;
      const leadsUnlocked = subscription?.usage?.leadsUnlocked || 0;
      const leadAccessCount = subscription?.limits?.leadAccessCount || 0;

      const hasQuotaLeft = !!subscription && (isUnlimited || leadAccessCount > leadsUnlocked);

      if (hasQuotaLeft) {
        leadPayload.isOpened = true;

        // Deduct 1 lead quota from broker subscription
        await purchasePlanRepository.markAsLeadOpened(subscription._id);

        // Send WhatsApp Notification to Broker if enabled & phone number exists
        if (env.WHATSAPP_ENABLED && broker?.mobile) {
          const templateId = env.WHATSAPP_LEAD_TEMPLATE_NAME || 'new_lead_notification';
          const customerName = leadPayload.customerName || 'Customer';
          const phone = leadPayload.phone || 'N/A';
          const propTitle = propertyName || 'Property';

          communicationService.sendWhatsApp({
            to: broker.mobile,
            body: `New Lead Alert!\n\nBuyer Name: ${customerName}\nContact Number: ${phone}\nInterested Property: ${propTitle}\n\nCheck your app for full details.`,
            templateId,
            metadata: {
              components: [
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', parameter_name: 'customer_name', text: customerName },
                    { type: 'text', parameter_name: 'phone_number', text: phone },
                    { type: 'text', parameter_name: 'property_name', text: propTitle },
                  ],
                },
              ],
            },
          }).catch((err) => console.error('[WhatsApp Lead Notification Error]:', err.message));
        }
      } else {
        leadPayload.isOpened = false;
      }
    } catch (err) {
      console.error('[Process Lead Quota Error]:', err.message);
      leadPayload.isOpened = false;
    }

    return leadPayload;
  },

  /**
   * Get lead by property and user (to check if already exists)
   */
  getLeadByPropertyAndUser: async (propertyId, userId) => {
    return leadRepository.findOne({ propertyId, userId });
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
};

export default leadService;