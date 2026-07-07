import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import AdminService from '@/server/src/modules/admin/admin.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

export async function POST(req) {
  try {
    // Read the refresh token from the httpOnly cookie (not the request body)
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const data = await AdminService.refreshToken(refreshToken);

    const { refreshToken: newRefreshToken, ...safeData } = data;

    const isProduction = process.env.NODE_ENV === 'production';

    // Return new access token in JSON; rotate the httpOnly cookie
    const res = NextResponse.json(successResponse(safeData, 'Token refreshed'));
    if (newRefreshToken) {
      res.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/api/v1/admin/auth/refresh',
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
