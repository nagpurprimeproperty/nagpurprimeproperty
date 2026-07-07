import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import subAdminService from '@/server/src/modules/sub-admin/sub-admin.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requireRole } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/sub-admins/stats */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const roleErr = requireRole(auth.user, ['admin']);
    if (roleErr) return roleErr;

    await connectDB();
    const stats = await subAdminService.getStats();
    return NextResponse.json(successResponse(stats, 'Stats fetched successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
