import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import staticPageService from '@/server/src/modules/static-page/static-pages.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/pages — public list all static pages */
export async function GET() {
  try {
    await connectDB();
    const pages = await staticPageService.listAll();
    return NextResponse.json(successResponse(pages));
  } catch (err) {
    return handleApiError(err);
  }
}
