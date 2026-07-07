import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Area from '@/server/src/models/area.model.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/areas — list all areas (admin, no publish filter) */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    await connectDB();
    const areas = await Area.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: areas });
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/v1/admin/areas — create area */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    await connectDB();
    const body = await req.json();

    // Normalize comma-separated strings to arrays
    if (typeof body.schools === 'string') body.schools = body.schools.split(',').map((s) => s.trim()).filter(Boolean);
    if (typeof body.hospitals === 'string') body.hospitals = body.hospitals.split(',').map((s) => s.trim()).filter(Boolean);

    const area = await Area.create(body);
    return NextResponse.json({ success: true, data: area }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
