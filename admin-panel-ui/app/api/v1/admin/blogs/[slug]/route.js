import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Blog from '@/server/src/models/blog.model.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/blogs/[slug] */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'blogs');
    if (permErr) return permErr;

    await connectDB();
    const { slug } = await params;
    const blog = await Blog.findOne({ slug }).lean();
    if (!blog) return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: blog });
  } catch (err) {
    return handleApiError(err);
  }
}

/** PUT /api/v1/admin/blogs/[slug] */
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PUT', 'blogs');
    if (permErr) return permErr;

    await connectDB();
    const { slug } = await params;
    const body = await req.json();

    if (typeof body.tags === 'string') body.tags = body.tags.split(',').map((t) => t.trim()).filter(Boolean);

    const blog = await Blog.findOneAndUpdate({ slug }, body, { new: true, runValidators: true }).lean();
    if (!blog) return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: blog });
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/v1/admin/blogs/[slug] */
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'DELETE', 'blogs');
    if (permErr) return permErr;

    await connectDB();
    const { slug } = await params;
    const blog = await Blog.findOneAndDelete({ slug });
    if (!blog) return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    return handleApiError(err);
  }
}
