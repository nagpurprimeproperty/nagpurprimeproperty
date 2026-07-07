import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import notificationService from '@/server/src/modules/notification/notification.service.js';
import { createNotificationSchema } from '@/server/src/modules/notification/notification.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/notifications */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'notifications');
    if (permErr) return permErr;

    await connectDB();
    const { searchParams } = req.nextUrl;
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 100);
    const result = await notificationService.list({
      adminId: auth.user.id,
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      page,
      limit,
      unreadOnly: searchParams.get('unreadOnly') === 'true',
    });

    return NextResponse.json(
      successResponse(result.data, 'Notifications fetched successfully', {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      })
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/v1/admin/notifications */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'POST', 'notifications');
    if (permErr) return permErr;

    await connectDB();
    const body = await req.json();
    const parsed = createNotificationSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const notification = await notificationService.create(parsed.data, {
      createdBy: auth.user.id,
      sendPush: parsed.data.sendPush ?? false,
    });

    return NextResponse.json(
      successResponse(notification, 'Notification created successfully'),
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
