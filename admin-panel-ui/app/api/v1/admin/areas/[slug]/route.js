import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Area from '@/server/src/models/area.model.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/areas/[slug] */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'areas');
    if (permErr) return permErr;

    await connectDB();
    const { slug } = await params;
    const area = await Area.findOne({ slug }).lean();
    if (!area) return NextResponse.json({ success: false, message: 'Area not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: area });
  } catch (err) {
    return handleApiError(err);
  }
}

/** PUT /api/v1/admin/areas/[slug] */
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PUT', 'areas');
    if (permErr) return permErr;

    await connectDB();
    const { slug } = await params;
    const body = await req.json();

    if (typeof body.schools === 'string') body.schools = body.schools.split(',').map((s) => s.trim()).filter(Boolean);
    if (typeof body.hospitals === 'string') body.hospitals = body.hospitals.split(',').map((s) => s.trim()).filter(Boolean);

    const area = await Area.findOneAndUpdate({ slug }, body, { new: true, runValidators: true }).lean();
    if (!area) return NextResponse.json({ success: false, message: 'Area not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: area });
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/v1/admin/areas/[slug] */
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'DELETE', 'areas');
    if (permErr) return permErr;

    await connectDB();
    const { slug } = await params;
    const area = await Area.findOneAndDelete({ slug });
    if (!area) return NextResponse.json({ success: false, message: 'Area not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Area deleted' });
  } catch (err) {
    return handleApiError(err);
  }
}
