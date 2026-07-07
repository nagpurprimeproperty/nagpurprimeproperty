import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import { getAuthUser } from '@/server/src/middlewares/auth.next.js';

export async function GET(req) {
  try {
    await connectDB();
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 12;

    const result = await propertyService.listProperties({ isSaved: true, page, limit }, user.id);
    return NextResponse.json({
      success: true,
      data: result.data || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 12,
      totalPages: result.totalPages || 1,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Error fetching saved properties' }, { status: 500 });
  }
}
