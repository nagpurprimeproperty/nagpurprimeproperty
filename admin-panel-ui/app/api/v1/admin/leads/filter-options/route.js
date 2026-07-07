import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import leadService from '@/server/src/modules/lead/lead.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/leads/filter-options */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'leads');
    if (permErr) return permErr;

    await connectDB();
    const options = await leadService.getFilterOptions();
    return NextResponse.json(successResponse(options, 'Filter options fetched successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
