import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import notificationService from '@/server/src/modules/notification/notification.service.js';
import { markReadSchema } from '@/server/src/modules/notification/notification.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/admin/notifications/read — mark all or specific as read */
export async function PATCH(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PATCH', 'notifications');
    if (permErr) return permErr;

    await connectDB();
    const body = await req.json();
    const parsed = markReadSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const result = await notificationService.markAsRead({
      adminId: auth.user.id,
      notificationIds: parsed.data.notificationIds,
      markAll: parsed.data.markAll ?? false,
    });

    return NextResponse.json(
      successResponse(result, 'Notifications marked as read')
    );
  } catch (err) {
    return handleApiError(err);
  }
}
