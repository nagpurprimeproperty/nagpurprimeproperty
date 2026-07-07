import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import userService from '@/server/src/modules/user/user.service.js';
import { createUserSchema } from '@/server/src/modules/user/user.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/users */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { searchParams } = req.nextUrl;
    const rawIsActive = searchParams.get('isActive') ?? undefined;
    // Normalise: broker-search sends "true"/"false"; users page sends "active"/"inactive"
    const isActive = rawIsActive === 'true'  ? 'active'
                   : rawIsActive === 'false' ? 'inactive'
                   : rawIsActive; // "active" | "inactive" | "all" | undefined — pass through
    const result = await userService.listUsers({
      search: searchParams.get('search') ?? undefined,
      isActive,
      page:  Number(searchParams.get('page')  ?? 1),
      limit: Number(searchParams.get('limit') ?? 10),
    });

    return NextResponse.json(
      successResponse(result.data, 'Users fetched successfully', {
        total: result.total, page: result.page,
        limit: result.limit, totalPages: result.totalPages,
      })
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/v1/admin/users */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'POST', 'users');
    if (permErr) return permErr;

    await connectDB();
    const body = await req.json();

    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const user = await userService.createUser(parsed.data);
    return NextResponse.json(successResponse(user, 'User created successfully'), { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
