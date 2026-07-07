import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import userService from '@/server/src/modules/user/user.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/users/:id/prop-lead-plan-query-stats */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const stats = await userService.getPropLeadPlanQueryStats(id);
    return NextResponse.json(successResponse(stats, 'Stats fetched successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
