import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import subAdminService from '@/server/src/modules/sub-admin/sub-admin.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requireRole } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/admin/sub-admins/:id/status */
export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const roleErr = requireRole(auth.user, ['admin']);
    if (roleErr) return roleErr;

    await connectDB();
    const { id } = await params;
    const subAdmin = await subAdminService.toggleStatus(id);
    const label = subAdmin.isActive ? 'activated' : 'deactivated';
    return NextResponse.json(successResponse(subAdmin, `Sub-admin ${label} successfully`));
  } catch (err) {
    return handleApiError(err);
  }
}
