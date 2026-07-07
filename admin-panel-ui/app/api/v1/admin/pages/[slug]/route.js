import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import staticPageService from '@/server/src/modules/static-page/static-pages.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requireRole } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** PUT /api/v1/admin/pages/:slug — admin only, update page content */
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const roleErr = requireRole(auth.user, ['admin']);
    if (roleErr) return roleErr;

    await connectDB();
    const { slug } = await params;
    const body = await req.json();
    const page = await staticPageService.update(slug, body);
    return NextResponse.json(successResponse(page, 'Page updated successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
