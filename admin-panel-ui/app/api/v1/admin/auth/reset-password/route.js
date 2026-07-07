import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import AdminService from '@/server/src/modules/admin/admin.service.js';
import { resetPasswordSchema } from '@/server/src/modules/admin/admin.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    await AdminService.resetPassword(parsed.data.token, parsed.data.newPassword, parsed.data.confirmPassword);
    return NextResponse.json(successResponse(null, 'Password reset successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
