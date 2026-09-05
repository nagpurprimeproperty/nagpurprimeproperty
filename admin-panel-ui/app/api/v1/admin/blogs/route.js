import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Blog from '@/server/src/models/blog.model.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/blogs — list all blogs (admin, no publish filter) */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'blogs');
    if (permErr) return permErr;

    await connectDB();
    const { searchParams } = req.nextUrl;
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 100);

    const total = await Blog.countDocuments();
    const totalPages = Math.ceil(total / limit) || 1;
    const blogs = await Blog.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/v1/admin/blogs — create blog */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'POST', 'blogs');
    if (permErr) return permErr;

    await connectDB();
    const body = await req.json();

    if (typeof body.tags === 'string') body.tags = body.tags.split(',').map((t) => t.trim()).filter(Boolean);

    const blog = await Blog.create(body);
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
