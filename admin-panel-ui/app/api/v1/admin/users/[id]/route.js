import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import userService from '@/server/src/modules/user/user.service.js';
import { updateUserSchema } from '@/server/src/modules/user/user.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/users/:id */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const user = await userService.getUser(id);
    return NextResponse.json(successResponse(user));
  } catch (err) {
    return handleApiError(err);
  }
}

/** PUT /api/v1/admin/users/:id */
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PUT', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const user = await userService.updateUser(id, parsed.data);
    return NextResponse.json(successResponse(user, 'User updated successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/v1/admin/users/:id */
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'DELETE', 'users');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    await userService.deleteUser(id);
    return NextResponse.json(successResponse(null, 'User deleted successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
