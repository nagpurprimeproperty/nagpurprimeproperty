import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import communicationService from '@/server/src/modules/communication/communication.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';
import { z } from 'zod';
import sanitizeHtmlLib from 'sanitize-html';

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

const emailSchema = z.object({
  type: z.literal('email'),
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1),
  body: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

const whatsappSchema = z.object({
  type: z.literal('whatsapp'),
  to: z.string().regex(E164_REGEX, 'Invalid phone number (E.164 required, e.g. +1234567890)'),
  body: z.string().min(1),
  templateId: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

const pushSchema = z.object({
  type: z.literal('push'),
  to: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

const sendSchema = z.discriminatedUnion('type', [emailSchema, whatsappSchema, pushSchema]);

function sanitizeHtml(html) {
  return sanitizeHtmlLib(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: { a: ['href'] },
    disallowedTagsMode: 'discard',
    allowIframeRelativeUrls: false,
  });
}

export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'POST', 'communication');
    if (permErr) return permErr;

    await connectDB();
    const body = await req.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validation Error', errors: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })) },
        { status: 400 }
      );
    }

    const { type, to, subject, body: messageBody, templateId, metadata } = parsed.data;
    const emailBody = type === 'email' ? sanitizeHtml(messageBody) : messageBody;
    let result;

    if (type === 'email') {
      result = await communicationService.sendEmail({ to, subject, html: emailBody, metadata });
    } else if (type === 'whatsapp') {
      result = await communicationService.sendWhatsApp({ to, body: messageBody, templateId, metadata });
    } else {
      result = await communicationService.sendPush({ fcmToken: to, title: subject, body: messageBody, metadata });
    }

    return NextResponse.json(successResponse(result, 'Message queued'));
  } catch (err) {
    return handleApiError(err);
  }
}
