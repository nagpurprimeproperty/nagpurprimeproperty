import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import notificationService from '@/server/src/modules/notification/notification.service.js';
import { updateNotificationSchema } from '@/server/src/modules/notification/notification.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/notifications/:id */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'notifications');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const notification = await notificationService.getById(id);
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(notification, 'Notification fetched successfully')
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/** PATCH /api/v1/admin/notifications/:id */
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

    const existing = await notificationService.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = updateNotificationSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const notification = await notificationService.update(id, parsed.data);
    return NextResponse.json(
      successResponse(notification, 'Notification updated successfully')
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/v1/admin/notifications/:id */
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'DELETE', 'notifications');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing notification ID' },
        { status: 400 }
      );
    }

    const existing = await notificationService.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    await notificationService.delete(id);
    return NextResponse.json(
      successResponse(null, 'Notification deleted successfully')
    );
  } catch (err) {
    return handleApiError(err);
  }
}
