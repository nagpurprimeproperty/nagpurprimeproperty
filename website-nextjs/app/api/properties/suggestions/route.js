import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import searchSuggestionsRepository from '@/server/src/modules/property/searchSuggestions.repository.js';
import { getAuthUser } from '@/server/src/middlewares/auth.next.js';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 8;

    const user = getAuthUser(req);
    const suggestions = await searchSuggestionsRepository.getSearchSuggestions(query, user?.id, limit);

    return NextResponse.json({ success: true, data: suggestions });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 500 });
  }
}
