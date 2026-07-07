import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import blogService from '@/server/src/modules/blog/blog.service.js';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;
    const blogs = await blogService.listBlogs({ limit });

    // Blogs change infrequently — cache at CDN/browser level.
    const response = NextResponse.json({ success: true, data: blogs });
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return response;
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 500 });
  }
}

