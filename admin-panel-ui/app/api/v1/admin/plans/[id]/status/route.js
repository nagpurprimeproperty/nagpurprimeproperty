import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import planService from '@/server/src/modules/subscription/plan.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/admin/plans/:id/status */
export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PATCH', 'plans');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const plan = await planService.toggleStatus(id);
    return NextResponse.json(successResponse(plan, `Plan ${plan.isActive ? 'activated' : 'deactivated'}`));
  } catch (err) {
    return handleApiError(err);
  }
}
