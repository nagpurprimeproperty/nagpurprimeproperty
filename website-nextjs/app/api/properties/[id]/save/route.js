import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import savedPropertyService from '@/server/src/modules/property/savedProperty.service.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';

export async function POST(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const { id } = await params;
    const userId = auth.user.id || auth.user._id;

    const result = await savedPropertyService.savePropertyToggle(userId, id);
    return NextResponse.json(result);
  } catch (err) {
    const status = err.status || 500;
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status });
  }
}
