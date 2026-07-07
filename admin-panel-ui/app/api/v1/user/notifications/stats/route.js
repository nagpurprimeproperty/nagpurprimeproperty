import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import notificationService from '@/server/src/modules/notification/notification.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';
import jwt from 'jsonwebtoken';

/** GET /api/v1/user/notifications/stats — user notification stats */
export async function GET(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const [total, unread] = await Promise.all([
      notificationService.listForUser({ userId, page: 1, limit: 1 }).then((r) => r.total),
      notificationService.getUserUnreadCount(userId),
    ]);

    return NextResponse.json(
      successResponse({ total, unread }, 'User notification stats fetched')
    );
  } catch (err) {
    return handleApiError(err);
  }
}
