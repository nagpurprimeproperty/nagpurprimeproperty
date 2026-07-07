import { NextResponse } from 'next/server';
import env from '@/server/src/config/env.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

const MAPS_BASE = 'https://maps.googleapis.com/maps/api';

/** GET /api/v1/admin/maps/places?input=Dharampeth */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const input = req.nextUrl.searchParams.get('input');
    if (!input || input.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'input query param must be at least 2 characters' },
        { status: 400 }
      );
    }

    const url =
      `${MAPS_BASE}/place/autocomplete/json` +
      `?input=${encodeURIComponent(input.trim())}` +
      `&components=country:in` +
      `&key=${env.GOOGLE_MAPS_API_KEY}`;

    const upstream = await fetch(url);
    const data = await upstream.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { success: false, message: `Google Maps error: ${data.status} — ${data.error_message ?? ''}` },
        { status: 502 }
      );
    }

    return NextResponse.json(successResponse(data.predictions ?? [], 'Places fetched successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
