import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Keyword from '@/server/src/models/keyword.model.js';
import { requireAuth } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/keywords — list all keywords (admin) */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    await connectDB();
    const keywords = await Keyword.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: keywords });
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/v1/admin/keywords — create keyword */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    await connectDB();
    const body = await req.json();

    // Handle bulk import
    if (body.bulk && Array.isArray(body.rows)) {
      const docs = body.rows
        .map((r) => ({
          keyword: (r.keyword || '').trim(),
          redirectUrl: (r.redirectUrl || '').trim(),
          category: (r.category || 'General').trim(),
          isFeatured: String(r.isFeatured || 'false').toLowerCase() === 'true',
          sortOrder: Number(r.sortOrder || 0),
        }))
        .filter((d) => d.keyword && d.redirectUrl);

      if (docs.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No valid rows found. Required columns: keyword, redirectUrl' },
          { status: 400 }
        );
      }

      const result = await Keyword.insertMany(docs, { ordered: false });
      return NextResponse.json(
        { success: true, data: result, message: `${result.length} keywords imported` },
        { status: 201 }
      );
    }

    const keyword = await Keyword.create(body);
    return NextResponse.json({ success: true, data: keyword }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
