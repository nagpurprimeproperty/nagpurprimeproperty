import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import keywordService from '@/server/src/modules/keyword/keyword.service.js';

/**
 * POST /api/keywords/[id]/click
 * Increment click count for a keyword (called from client on keyword chip click)
 */
export async function POST(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await keywordService.trackClick(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Internal error' },
      { status: err.status || 500 }
    );
  }
}
