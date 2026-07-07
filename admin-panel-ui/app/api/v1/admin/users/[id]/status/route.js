import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import userService from '@/server/src/modules/user/user.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/admin/users/:id/status */
export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PATCH', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const user = await userService.toggleStatus(id);
    const label = user.isActive ? 'activated' : 'deactivated';
    return NextResponse.json(successResponse(user, `User ${label} successfully`));
  } catch (err) {
    return handleApiError(err);
  }
}
