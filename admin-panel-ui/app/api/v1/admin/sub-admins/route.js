import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import subAdminService from '@/server/src/modules/sub-admin/sub-admin.service.js';
import { createSubAdminSchema } from '@/server/src/modules/sub-admin/sub-admin.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requireRole } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/sub-admins */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const roleErr = requireRole(auth.user, ['admin']);
    if (roleErr) return roleErr;

    await connectDB();
    const { searchParams } = req.nextUrl;
    const result = await subAdminService.listSubAdmins({
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      page:   Number(searchParams.get('page')  ?? 1),
      limit:  Number(searchParams.get('limit') ?? 10),
    });

    return NextResponse.json(
      successResponse(result.data, 'Sub-admins fetched successfully', {
        total: result.total, page: result.page,
        limit: result.limit, totalPages: result.totalPages,
      })
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/v1/admin/sub-admins */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const roleErr = requireRole(auth.user, ['admin']);
    if (roleErr) return roleErr;

    await connectDB();
    const body = await req.json();

    const parsed = createSubAdminSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { permissions = [], ...adminData } = parsed.data;
    const subAdmin = await subAdminService.createSubAdmin(adminData, permissions);
    return NextResponse.json(successResponse(subAdmin, 'Sub-admin created successfully'), { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
