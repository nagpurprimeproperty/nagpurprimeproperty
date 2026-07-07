import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import keywordService from '@/server/src/modules/keyword/keyword.service.js';

/** GET /api/keywords — public: return all active keywords */
export async function GET() {
  try {
    await connectDB();
    const keywords = await keywordService.getActiveKeywords();
    return NextResponse.json({ success: true, data: keywords });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
