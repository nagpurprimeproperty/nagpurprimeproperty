import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import { getAuthUser } from '@/server/src/middlewares/auth.next.js';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const user = getAuthUser(req);
    const userIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const property = await propertyService.getProperty(id, user?.id, userIp);
    return NextResponse.json({ success: true, data: property });
  } catch (err) {
    const status = err.status || 500;
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status });
  }
}
