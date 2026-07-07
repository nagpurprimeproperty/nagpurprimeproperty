import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import analyticsService from '@/server/src/modules/analytics/analytics.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'analytics');
    if (permErr) return permErr;
    await connectDB();
    const period = req.nextUrl.searchParams.get('period') ?? 'week';
    const data = await analyticsService.getUserActivity(period);
    return NextResponse.json(successResponse(data, 'User activity fetched'));
  } catch (err) { return handleApiError(err); }
}
