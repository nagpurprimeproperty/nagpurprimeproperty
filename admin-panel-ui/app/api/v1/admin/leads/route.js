import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import leadService from '@/server/src/modules/lead/lead.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/leads */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'leads');
    if (permErr) return permErr;

    await connectDB();
    const { searchParams } = req.nextUrl;
    const result = await leadService.listLeads({
      search:       searchParams.get('search')       ?? undefined,
      status:       searchParams.get('status')       ?? undefined,
      area:         searchParams.get('area')         ?? undefined,
      propertyType: searchParams.get('propertyType') ?? undefined,
      dateFrom:     searchParams.get('dateFrom')     ?? undefined,
      dateTo:       searchParams.get('dateTo')       ?? undefined,
      page:         Number(searchParams.get('page')  ?? 1),
      limit:        Number(searchParams.get('limit') ?? 10),
    });

    return NextResponse.json(
      successResponse(result.data, 'Leads fetched successfully', {
        total: result.total, page: result.page,
        limit: result.limit, totalPages: result.totalPages,
      })
    );
  } catch (err) {
    return handleApiError(err);
  }
}
