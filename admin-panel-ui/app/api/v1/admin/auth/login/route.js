import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import { adminLoginSchema } from '@/server/src/modules/admin/admin.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';
import AdminService from '@/server/src/modules/admin/admin.service.js';
import { rateLimitCheck, getRateLimitKey } from '@/server/src/utils/rate-limiter.js';

export async function POST(req) {
  try {
    const body = await req.json();

    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    // Rate limit: 5 attempts per 15 minutes per IP and username
    const rateKey = getRateLimitKey(req, 'login');
    const rate = rateLimitCheck(rateKey, 5, 15 * 60 * 1000);
    const userRateKey = `login:user:${parsed.data.username || parsed.data.email}`;
    const userRate = rateLimitCheck(userRateKey, 5, 15 * 60 * 1000);

    if (!rate.allowed || !userRate.allowed) {
      const resetAt = Math.max(rate.resetAt || 0, userRate.resetAt || 0);
      const deltaSec = Number.isFinite(resetAt) ? Math.ceil((resetAt - Date.now()) / 1000) : 0;
      const safeRetryAfter = String(Math.max(0, deltaSec));
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': safeRetryAfter } }
      );
    }

    await connectDB();
    const data = await AdminService.login(parsed.data);

    const { refreshToken, ...safeData } = data;

    const isProduction = process.env.NODE_ENV === 'production';

    // Build response — access token in JSON, refresh token in httpOnly cookie
    const res = NextResponse.json(successResponse(safeData, 'Login successful'));
    res.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/v1/admin/auth/refresh',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
