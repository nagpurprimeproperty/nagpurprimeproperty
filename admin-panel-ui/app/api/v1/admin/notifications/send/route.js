import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import notificationService from '@/server/src/modules/notification/notification.service.js';
import { sendPushSchema } from '@/server/src/modules/notification/notification.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** POST /api/v1/admin/notifications/send */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'POST', 'notifications');
    if (permErr) return permErr;

    await connectDB();
    const body = await req.json();
    const parsed = sendPushSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const result = await notificationService.sendPush(parsed.data);

    return NextResponse.json(
      successResponse(result, 'Push notification sent successfully')
    );
  } catch (err) {
    return handleApiError(err);
  }
}
