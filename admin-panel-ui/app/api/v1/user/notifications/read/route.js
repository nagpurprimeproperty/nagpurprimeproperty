import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import notificationService from '@/server/src/modules/notification/notification.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/user/notifications/read — mark user notifications as read */
export async function PATCH(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const jwt = await import('jsonwebtoken');
    const verify = jwt.default?.verify || jwt.verify;
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }
    const userId = decoded?.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const markAll = typeof body.markAll === 'boolean' ? body.markAll : false;
    const notificationIds = Array.isArray(body.notificationIds)
      ? body.notificationIds.filter((id) => typeof id === 'string' && id.trim().length > 0)
      : [];

    if (!markAll && notificationIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Either notificationIds (non-empty array) or markAll must be provided' },
        { status: 400 }
      );
    }

    const result = await notificationService.markAsReadForUser({
      userId,
      notificationIds: markAll ? undefined : notificationIds,
      markAll,
    });

    return NextResponse.json(successResponse(result, 'Notifications marked as read'));
  } catch (err) {
    return handleApiError(err);
  }
}
