import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import UserService from '@/server/src/modules/user/user.service.js';

export async function POST(req) {
  try {
    await connectDB();
    const { mobile, otp, fcmToken } = await req.json();
    const response = await UserService.verifyOTP(mobile, otp);
    const user = response?.user;
    const token = response?.token;

    if (fcmToken && user?._id) {
      await UserService.updateFcmToken(user._id, fcmToken);
    }

    const res = NextResponse.json({ success: true, message: 'OTP verified successfully', data: { user, token } });
    // Set cookie userToken
    res.cookies.set('userToken', token, { httpOnly: true, path: '/' });
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 400 });
  }
}
