import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import leadService from '@/server/src/modules/lead/lead.service.js';
import { updateLeadSchema } from '@/server/src/modules/lead/lead.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/leads/:id */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'leads');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const lead = await leadService.getLead(id);
    return NextResponse.json(successResponse(lead));
  } catch (err) {
    return handleApiError(err);
  }
}

/** PUT /api/v1/admin/leads/:id */
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PUT', 'leads');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const lead = await leadService.updateLead(id, parsed.data);
    return NextResponse.json(successResponse(lead, 'Lead updated successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/v1/admin/leads/:id */
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'DELETE', 'leads');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    await leadService.deleteLead(id);
    return NextResponse.json(successResponse(null, 'Lead deleted successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
