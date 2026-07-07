import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import planService from '@/server/src/modules/subscription/plan.service.js';
import { updatePlanSchema } from '@/server/src/modules/subscription/plan.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/plans/:id */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'plans');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const plan = await planService.getPlan(id);
    return NextResponse.json(successResponse(plan));
  } catch (err) {
    return handleApiError(err);
  }
}

/** PUT /api/v1/admin/plans/:id */
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PUT', 'plans');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const parsed = updatePlanSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const plan = await planService.updatePlan(id, parsed.data);
    return NextResponse.json(successResponse(plan, 'Plan updated successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/v1/admin/plans/:id */
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'DELETE', 'plans');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    await planService.deletePlan(id);
    return NextResponse.json(successResponse(null, 'Plan deleted successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
