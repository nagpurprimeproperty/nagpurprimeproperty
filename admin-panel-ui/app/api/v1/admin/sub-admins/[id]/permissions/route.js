import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import subAdminService from '@/server/src/modules/sub-admin/sub-admin.service.js';
import { updatePermissionsSchema } from '@/server/src/modules/sub-admin/sub-admin.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requireRole } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** PUT /api/v1/admin/sub-admins/:id/permissions */
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const roleErr = requireRole(auth.user, ['admin']);
    if (roleErr) return roleErr;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const parsed = updatePermissionsSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const updated = await subAdminService.updatePermissions(id, parsed.data.permissions);
    return NextResponse.json(successResponse(updated, 'Permissions updated successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
