import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Keyword from '@/server/src/models/keyword.model.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/keywords/[id] — get single keyword */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    await connectDB();
    const { id } = await params;
    const keyword = await Keyword.findById(id).lean();
    if (!keyword) {
      return NextResponse.json({ success: false, message: 'Keyword not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: keyword });
  } catch (err) {
    return handleApiError(err);
  }
}

/** PUT /api/v1/admin/keywords/[id] — update keyword */
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const keyword = await Keyword.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!keyword) {
      return NextResponse.json({ success: false, message: 'Keyword not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: keyword, message: 'Keyword updated successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/v1/admin/keywords/[id] — delete keyword */
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    await connectDB();
    const { id } = await params;
    const keyword = await Keyword.findByIdAndDelete(id);
    if (!keyword) {
      return NextResponse.json({ success: false, message: 'Keyword not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Keyword deleted successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}
