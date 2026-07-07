import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import AdminService from '@/server/src/modules/admin/admin.service.js';
import { adminUpdatePassword } from '@/server/src/modules/admin/admin.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/admin/profile/password-update */
export async function PATCH(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const body = await req.json();

    const parsed = adminUpdatePassword.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const data = await AdminService.updatePassword(
      auth.user.id,
      parsed.data.oldPassword,
      parsed.data.newPassword
    );
    return NextResponse.json(successResponse(data, 'Password updated'));
  } catch (err) {
    return handleApiError(err);
  }
}
