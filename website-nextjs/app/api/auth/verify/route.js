import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import UserService from '@/server/src/modules/user/user.service.js';

export async function POST(req) {
  try {
    await connectDB();
    const { mobile, otp, fcmToken, appleToken, pushToken } = await req.json();
    const response = await UserService.verifyOTP(mobile, otp);
    const user = response?.user;
    const token = response?.token;

    const tokenToSave = fcmToken || pushToken || appleToken;
    if (tokenToSave && user?._id) {
      await UserService.updateFcmToken(user._id, tokenToSave);
    }

    const res = NextResponse.json({ success: true, message: 'OTP verified successfully', data: { user, token } });
    // Set cookie userToken
    res.cookies.set('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
    });
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 400 });
  }
}
