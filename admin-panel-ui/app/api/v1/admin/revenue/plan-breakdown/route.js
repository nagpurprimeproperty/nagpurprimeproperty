import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import revenueService from '@/server/src/modules/revenue/revenue.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'revenue');
    if (permErr) return permErr;
    await connectDB();
    const data = await revenueService.getPlanBreakdown();
    return NextResponse.json(successResponse(data, 'Plan breakdown fetched successfully'));
  } catch (err) { return handleApiError(err); }
}
