import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import areaService from '@/server/src/modules/area/area.service.js';

export async function GET() {
  try {
    await connectDB();
    const areas = await areaService.listAreas();

    // Areas change infrequently — cache aggressively at CDN/browser level.
    // s-maxage=300: CDN serves from cache for 5 min before revalidating.
    // stale-while-revalidate=600: serve stale up to 10 min while revalidating in background.
    const response = NextResponse.json({ success: true, data: areas });
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 500 });
  }
}
