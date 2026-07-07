import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/properties/localities — distinct localities from available properties */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'properties');
    if (permErr) return permErr;

    await connectDB();
    const status = req.nextUrl.searchParams.get('status') ?? 'Active';
    const localities = await propertyService.getDistinctLocalities({ status });
    return NextResponse.json(successResponse(localities, 'Localities fetched successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
