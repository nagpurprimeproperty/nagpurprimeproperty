import env from '../../config/env.js';
import CommunicationLog from '../../models/communicationLog.model.js';

/**
 * GET /webhook/whatsapp
 * Meta webhook verification challenge.
 */
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified successfully');
    return res.status(200).send(challenge);
  }

  console.warn('❌ WhatsApp webhook verification failed: Invalid verify token or mode');
  return res.sendStatus(403);
};

/**
 * POST /webhook/whatsapp
 * Receives real-time events (delivery status updates) from Meta.
 */
export const receiveWebhook = async (req, res) => {
  try {
    const { body } = req;
    console.log('📩 WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Meta webhook payloads are nested inside entry changes
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (value && value.statuses) {
      for (const statusObj of value.statuses) {
        const { id: messageId, status, timestamp, errors } = statusObj;

        // Find the corresponding communication log
        const log = await CommunicationLog.findOne({ 'metadata.messageId': messageId });

        if (log) {
          console.log(`Updating log ${log._id} for messageId ${messageId} to status: ${status}`);
          
          // Initialize statusHistory if it doesn't exist
          if (!log.metadata.statusHistory) {
            log.metadata.statusHistory = [];
          }
          log.metadata.statusHistory.push({
            status,
            timestamp: new Date(timestamp * 1000),
            rawEvent: statusObj,
          });

          // Map Meta status to our local log status
          if (status === 'delivered' || status === 'read') {
            log.status = 'delivered';
            log.deliveredAt = new Date(timestamp * 1000);
          } else if (status === 'failed') {
            log.status = 'failed';
            log.failedAt = new Date(timestamp * 1000);
            if (errors && errors.length > 0) {
              log.errorMessage = `${errors[0].title || errors[0].message} (Code: ${errors[0].code})`;
            } else {
              log.errorMessage = 'WhatsApp delivery failed (no error code provided)';
            }
          } else if (status === 'sent') {
            log.status = 'sent';
            log.sentAt = new Date(timestamp * 1000);
          }

          // Mark metadata as modified since it's a mixed type mongoose object
          log.markModified('metadata');
          await log.save();
        } else {
          console.log(`No communication log found matching messageId: ${messageId}`);
        }
      }
    }

    // Always return a 200 OK to Meta to acknowledge receipt
    return res.sendStatus(200);
  } catch (error) {
    console.error('Error handling WhatsApp webhook:', error);
    // Still return 200 to prevent Meta from retrying or disabling the webhook
    return res.sendStatus(200);
  }
};
