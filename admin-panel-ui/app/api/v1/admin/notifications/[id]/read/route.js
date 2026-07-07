import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import notificationService from '@/server/src/modules/notification/notification.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/admin/notifications/:id/read */
export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PATCH', 'notifications');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing notification ID' },
        { status: 400 }
      );
    }
    const result = await notificationService.markAsRead({
      adminId: auth.user.id,
      notificationIds: [id],
    });

    return NextResponse.json(
      successResponse(result, 'Notification marked as read')
    );
  } catch (err) {
    return handleApiError(err);
  }
}
