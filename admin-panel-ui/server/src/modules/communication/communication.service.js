import CommunicationLog from '../../models/communicationLog.model.js';
import mailService from '../../services/mail.service.js';
import mongoose from 'mongoose';

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
    if (process.env.WHATSAPP_ENABLED !== 'true') {
      const err = new Error('WhatsApp integration not configured');
      err.status = 503;
      throw err;
    }
    const log = await CommunicationLog.create({
      type: 'whatsapp',
      recipient: to,
      body,
      status: 'pending',
      templateId,
      metadata,
    });

    // TODO: Integrate with actual WhatsApp Business API (e.g. Meta Cloud API, Twilio, MSG91)
    log.status = 'failed';
    log.failedAt = new Date();
    log.errorMessage = 'WhatsApp integration not configured';
    await log.save();
    const err = new Error('WhatsApp integration not configured');
    err.status = 503;
    throw err;
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

    try {
      const pushService = (await import('../../services/push.service.js')).default;
      await pushService.sendToDevice({
        token: fcmToken,
        title,
        body,
        data,
      });
      log.status = 'sent';
      log.sentAt = new Date();
      await log.save();
      return { success: true, logId: log._id };
    } catch (error) {
      log.status = 'failed';
      log.failedAt = new Date();
      log.errorMessage = error?.message ? String(error.message).slice(0, 500) : 'Push service failure';
      await log.save();
      const err = new Error('Failed to send push notification');
      err.status = 500;
      err.cause = error;
      throw err;
    }
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
