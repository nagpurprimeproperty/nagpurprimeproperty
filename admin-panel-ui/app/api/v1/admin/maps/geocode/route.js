import { NextResponse } from 'next/server';
import env from '@/server/src/config/env.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

const MAPS_BASE = 'https://maps.googleapis.com/maps/api';

/** GET /api/v1/admin/maps/geocode?latlng=21.1458,79.0882 */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { latlng } = Object.fromEntries(req.nextUrl.searchParams);
    if (!latlng) {
      return NextResponse.json(
        { success: false, message: 'latlng query param is required (e.g. 21.1458,79.0882)' },
        { status: 400 }
      );
    }

    const url = `${MAPS_BASE}/geocode/json?latlng=${encodeURIComponent(latlng)}&key=${env.GOOGLE_MAPS_API_KEY}`;
    const upstream = await fetch(url);
    const data = await upstream.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { success: false, message: `Google Maps error: ${data.status} — ${data.error_message ?? ''}` },
        { status: 502 }
      );
    }

    return NextResponse.json(successResponse(data, 'Geocode fetched successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
