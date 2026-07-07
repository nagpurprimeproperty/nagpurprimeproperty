import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import subAdminService from '@/server/src/modules/sub-admin/sub-admin.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requireRole } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/sub-admins/:id */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const roleErr = requireRole(auth.user, ['admin']);
    if (roleErr) return roleErr;

    await connectDB();
    const { id } = await params;
    const subAdmin = await subAdminService.getSubAdmin(id);
    return NextResponse.json(successResponse(subAdmin));
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/v1/admin/sub-admins/:id */
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const roleErr = requireRole(auth.user, ['admin']);
    if (roleErr) return roleErr;

    await connectDB();
    const { id } = await params;
    await subAdminService.deleteSubAdmin(id);
    return NextResponse.json(successResponse(null, 'Sub-admin deleted successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
