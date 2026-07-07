import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import notificationService from '@/server/src/modules/notification/notification.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/notifications/stats */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'notifications');
    if (permErr) return permErr;

    await connectDB();
    const stats = await notificationService.getStats(auth.user.id);
    return NextResponse.json(
      successResponse(stats, 'Notification stats fetched')
    );
  } catch (err) {
    return handleApiError(err);
  }
}
