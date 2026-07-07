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
    const { searchParams } = req.nextUrl;
    const result = await revenueService.getTransactions({
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      page:   Number(searchParams.get('page')  ?? 1),
      limit:  Number(searchParams.get('limit') ?? 10),
    });
    return NextResponse.json(
      successResponse(result.data, 'Transactions fetched successfully', {
        total: result.total, page: result.page,
        limit: result.limit, totalPages: result.totalPages,
        stats: result.stats,
      })
    );
  } catch (err) { return handleApiError(err); }
}
