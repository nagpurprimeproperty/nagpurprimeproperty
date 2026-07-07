import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import UserService from '@/server/src/modules/user/user.service.js';
import { getAuthUser } from '@/server/src/middlewares/auth.next.js';

export async function POST(req) {
  try {
    await connectDB();
    const user = getAuthUser(req);
    if (user?.id) {
      // Clear FCM token so push notifications stop after logout
      await UserService.updateFcmToken(user.id, null);
    }
    const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
    res.cookies.set('userToken', '', { expires: new Date(0), path: '/' });
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 500 });
  }
}
