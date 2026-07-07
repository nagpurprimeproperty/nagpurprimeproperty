import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import planService from '@/server/src/modules/subscription/plan.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/plans/stats */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'plans');
    if (permErr) return permErr;

    await connectDB();
    const stats = await planService.getStats();
    return NextResponse.json(successResponse(stats, 'Stats fetched'));
  } catch (err) {
    return handleApiError(err);
  }
}
