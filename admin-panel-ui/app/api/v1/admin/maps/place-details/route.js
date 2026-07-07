import { NextResponse } from 'next/server';
import env from '@/server/src/config/env.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

const MAPS_BASE = 'https://maps.googleapis.com/maps/api';

/** GET /api/v1/admin/maps/place-details?place_id=ChIJ... */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const place_id = req.nextUrl.searchParams.get('place_id');
    if (!place_id) {
      return NextResponse.json(
        { success: false, message: 'place_id query param is required' },
        { status: 400 }
      );
    }

    const fields = 'address_components,geometry,formatted_address';
    const url =
      `${MAPS_BASE}/place/details/json` +
      `?place_id=${encodeURIComponent(place_id)}` +
      `&fields=${fields}` +
      `&key=${env.GOOGLE_MAPS_API_KEY}`;

    const upstream = await fetch(url);
    const data = await upstream.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { success: false, message: `Google Maps error: ${data.status} — ${data.error_message ?? ''}` },
        { status: 502 }
      );
    }

    return NextResponse.json(successResponse(data.result ?? {}, 'Place details fetched successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
