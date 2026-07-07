import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import planService from '@/server/src/modules/subscription/plan.service.js';
import { createPlanSchema } from '@/server/src/modules/subscription/plan.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/plans */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'plans');
    if (permErr) return permErr;

    await connectDB();
    const { searchParams } = req.nextUrl;
    const result = await planService.listPlans({
      isActive: searchParams.get('isActive') ?? undefined,
      page:     Number(searchParams.get('page')  ?? 1),
      limit:    Number(searchParams.get('limit') ?? 10),
    });

    return NextResponse.json(
      successResponse(result.data, 'Plans fetched successfully', {
        total: result.total, page: result.page,
        limit: result.limit, totalPages: result.totalPages,
      })
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/v1/admin/plans */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'POST', 'plans');
    if (permErr) return permErr;

    await connectDB();
    const body = await req.json();

    const parsed = createPlanSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const plan = await planService.createPlan(parsed.data);
    return NextResponse.json(successResponse(plan, 'Plan created successfully'), { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
