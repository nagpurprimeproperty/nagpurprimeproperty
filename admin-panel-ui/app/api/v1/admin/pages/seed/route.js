import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import staticPageService from '@/server/src/modules/static-page/static-pages.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requireRole } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** POST /api/v1/admin/pages/seed — admin only, seed default pages */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const roleErr = requireRole(auth.user, ['admin']);
    if (roleErr) return roleErr;

    await connectDB();
    const seeded = await staticPageService.seedDefaults();
    return NextResponse.json(
      successResponse(seeded, `Seeded ${seeded.length} pages successfully`)
    );
  } catch (err) {
    return handleApiError(err);
  }
}
