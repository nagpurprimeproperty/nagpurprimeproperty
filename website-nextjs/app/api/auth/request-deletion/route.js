import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import UserService from '@/server/src/modules/user/user.service.js';

export async function POST(req) {
  try {
    await connectDB();
    const { mobile } = await req.json();
    const otp = await UserService.requestDeletion(mobile);
    return NextResponse.json({ success: true, message: 'OTP sent successfully', data: { otp } });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: err.status || 500 });
  }
}
