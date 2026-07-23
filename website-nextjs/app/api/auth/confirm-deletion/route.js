import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import UserService from '@/server/src/modules/user/user.service.js';

export async function POST(req) {
  try {
    await connectDB();
    const { mobile, otp } = await req.json();
    await UserService.confirmDeletion(mobile, otp);
    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: err.status || 500 });
  }
}
