import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import staticPageService from '@/server/src/modules/static-page/static-pages.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/pages/:slug — public fetch single static page */
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const page = await staticPageService.getBySlug(slug);
    return NextResponse.json(successResponse(page));
  } catch (err) {
    return handleApiError(err);
  }
}
