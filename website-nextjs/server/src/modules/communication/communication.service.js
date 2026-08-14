import CommunicationLog from '../../models/communicationLog.model.js';
import mailService from '../../services/mail.service.js';
import mongoose from 'mongoose';
import env from '../../config/env.js';

const communicationService = {
  /**
   * Send an email and log the attempt.
   */
  sendEmail: async ({ to, subject, html, text, metadata = {} }) => {
    if (!to || typeof to !== 'string' || !to.trim()) {
      const err = new Error('Recipient (to) is required');
      err.status = 400;
      throw err;
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      const err = new Error('Subject is required');
      err.status = 400;
      throw err;
    }
    if ((!html || !html.trim()) && (!text || !text.trim())) {
      const err = new Error('Either html or text body is required');
      err.status = 400;
      throw err;
    }
    const log = await CommunicationLog.create({
      type: 'email',
      recipient: to,
      subject,
      body: html || text,
      status: 'pending',
      metadata,
    });

    try {
      await Promise.race([
        mailService.send({ to, subject, html, text }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Mail service timeout')), 30_000)),
      ]);
      log.status = 'sent';
      log.sentAt = new Date();
      await log.save();
      return { success: true, logId: log._id };
    } catch (error) {
      log.status = 'failed';
      log.failedAt = new Date();
      log.errorMessage = error?.message ? String(error.message).slice(0, 500) : 'Mail service failure';
      await log.save();
      const err = new Error('Failed to send email');
      err.status = 500;
      err.cause = error;
      throw err;
    }
  },

  /**
   * Send WhatsApp message (placeholder — integrate with WhatsApp Business API).
   */
  sendWhatsApp: async ({ to, body, templateId, metadata = {} }) => {
    if (!env.WHATSAPP_ENABLED) {
      const err = new Error('WhatsApp integration not configured/enabled');
      err.status = 503;
      throw err;
    }

    const cleanNumber = to.replace(/\D/g, '');
    const recipientNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    const log = await CommunicationLog.create({
      type: 'whatsapp',
      recipient: recipientNumber,
      body: body || `Template: ${templateId}`,
      status: 'pending',
      templateId,
      metadata,
    });

    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientNumber,
      };

      if (templateId) {
        let components = [];
        if (metadata.components) {
          components = metadata.components;
        } else if (metadata.otp) {
          components = [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: metadata.otp,
                },
              ],
            },
          ];

          if (env.WHATSAPP_OTP_TEMPLATE_HAS_BUTTON) {
            components.push({
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                {
                  type: 'text',
                  text: metadata.otp,
                },
              ],
            });
          }
        } else if (body) {
          components = [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: body,
                },
              ],
            },
          ];
        }

        payload.type = 'template';
        payload.template = {
          name: templateId,
          language: { code: metadata.languageCode || env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || 'en_US' },
          components,
        };
      } else {
        payload.type = 'text';
        payload.text = { body };
      }

      const apiVersion = env.WHATSAPP_API_VERSION || 'v20.0';
      const url = `https://graph.facebook.com/${apiVersion}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errMsg = responseData?.error?.message || `WhatsApp API responded with status ${response.status}`;
        throw new Error(errMsg);
      }

      const messageId = responseData?.messages?.[0]?.id;
      log.status = 'sent';
      log.sentAt = new Date();
      log.metadata = { ...log.metadata, messageId, apiResponse: responseData };
      await log.save();

      return { success: true, logId: log._id, messageId };
    } catch (error) {
      log.status = 'failed';
      log.failedAt = new Date();
      log.errorMessage = error?.message ? String(error.message).slice(0, 500) : 'WhatsApp service failure';
      await log.save();

      const err = new Error(log.errorMessage);
      err.status = 500;
      err.cause = error;
      throw err;
    }
  },

  /**
   * Send push notification via Firebase (placeholder).
   */
  sendPush: async ({ fcmToken, title, body, data = {}, metadata = {} }) => {
    const log = await CommunicationLog.create({
      type: 'push',
      recipient: fcmToken,
      subject: title,
      body,
      status: 'pending',
      metadata: { ...metadata, data },
    });

    // TODO: Integrate with firebase-admin messaging
    log.status = 'failed';
    log.failedAt = new Date();
    log.errorMessage = 'Push notification integration not configured';
    await log.save();
    const err = new Error('Push notification integration not configured');
    err.status = 503;
    throw err;
  },

  /**
   * List communication logs with pagination.
   */
  listLogs: async ({ type, status, page = 1, limit = 20 } = {}) => {
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      CommunicationLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
      CommunicationLog.countDocuments(filter),
    ]);

    return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) || 1 };
  },

  /**
   * Get a single log by ID.
   */
  getLogById: async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Invalid log id');
      err.status = 400;
      throw err;
    }
    const log = await CommunicationLog.findById(id).lean();
    if (!log) {
      const err = new Error('Log not found');
      err.status = 404;
      throw err;
    }
    return log;
  },
};

export default communicationService;
