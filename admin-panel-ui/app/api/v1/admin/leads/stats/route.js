import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import leadService from '@/server/src/modules/lead/lead.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/leads/stats */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'leads');
    if (permErr) return permErr;

    await connectDB();
    const stats = await leadService.getStats();
    return NextResponse.json(successResponse(stats, 'Stats fetched successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
