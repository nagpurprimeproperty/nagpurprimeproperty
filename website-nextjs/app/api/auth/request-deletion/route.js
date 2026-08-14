import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import UserService from '@/server/src/modules/user/user.service.js';
import env from '@/server/src/config/env.js';

export async function POST(req) {
  try {
    await connectDB();
    const { mobile } = await req.json();
    const otp = await UserService.requestDeletion(mobile);
    const isStaticTestUser = mobile === '9999999999' || mobile === '1234567890';
    const showOTP = env.NODE_ENV !== 'production' || isStaticTestUser || !env.WHATSAPP_ENABLED;
    return NextResponse.json({ success: true, message: 'OTP sent successfully', data: showOTP ? { otp } : undefined });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: err.status || 500 });
  }
}
