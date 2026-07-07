import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import StaticPage from '@/server/src/modules/static-page/static-page.model.js';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const page = await StaticPage.findOne({ slug }).lean();
    if (!page) {
      return NextResponse.json({ success: false, message: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: page });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 500 });
  }
}
