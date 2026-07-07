import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import leadService from '@/server/src/modules/lead/lead.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/users/:id/queries
 *  "Queries" here refers to leads created BY the user (as a customer).
 *  Internally routed through leadService.getQueriesByUser. */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json({ success: false, message: 'Invalid user id' }, { status: 400 });
    }
    const { searchParams } = req.nextUrl;
    const page = Math.max(Number.isFinite(Number(searchParams.get('page'))) ? Number(searchParams.get('page')) : 1, 1);
    const limit = Math.min(Math.max(Number.isFinite(Number(searchParams.get('limit'))) ? Number(searchParams.get('limit')) : 10, 1), 100);

    const result = await leadService.getQueriesByUser(id, { page, limit });

    return NextResponse.json(
      successResponse(result.data, 'Queries fetched successfully', {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      })
    );
  } catch (err) {
    return handleApiError(err);
  }
}
