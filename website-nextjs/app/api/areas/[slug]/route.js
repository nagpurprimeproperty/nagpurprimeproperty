import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import areaService from '@/server/src/modules/area/area.service.js';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const area = await areaService.getAreaBySlug(slug);
    return NextResponse.json({ success: true, data: area });
  } catch (err) {
    const status = err.status || 500;
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status });
  }
}
