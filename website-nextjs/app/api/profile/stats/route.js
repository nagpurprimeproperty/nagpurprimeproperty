import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import UserService from '@/server/src/modules/user/user.service.js';
import { getAuthUser } from '@/server/src/middlewares/auth.next.js';

export async function GET(req) {
  try {
    await connectDB();
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const stats = await UserService.getStats(user.id);
    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Error fetching stats' }, { status: 500 });
  }
}
