import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import AdminService from '@/server/src/modules/admin/admin.service.js';
import { adminForgotPasswordSchema } from '@/server/src/modules/admin/admin.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';
import { rateLimitCheck, getRateLimitKey } from '@/server/src/utils/rate-limiter.js';

export async function POST(req) {
  try {
    // Rate limit: 3 attempts per 15 minutes per IP
    const rateKey = getRateLimitKey(req, 'forgot-password');
    const rate = rateLimitCheck(rateKey, 3, 15 * 60 * 1000);
    if (!rate.allowed) {
      const deltaSec = Number.isFinite(rate.resetAt) ? Math.ceil((rate.resetAt - Date.now()) / 1000) : 0;
      const safeRetryAfter = String(Math.max(0, deltaSec));
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': safeRetryAfter } }
      );
    }

    await connectDB();
    const body = await req.json();

    const parsed = adminForgotPasswordSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const data = await AdminService.forgotPassword(parsed.data.email);
    return NextResponse.json(successResponse(data));
  } catch (err) {
    return handleApiError(err);
  }
}
