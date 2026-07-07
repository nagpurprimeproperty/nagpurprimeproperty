import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import leadService from '@/server/src/modules/lead/lead.service.js';
import { updateLeadStatusSchema } from '@/server/src/modules/lead/lead.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/admin/leads/:id/status */
export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PATCH', 'leads');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const parsed = updateLeadStatusSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const lead = await leadService.updateStatus(id, parsed.data.status);
    const label = lead.status.toLowerCase();
    return NextResponse.json(successResponse(lead, `Lead marked as ${label}`));
  } catch (err) {
    return handleApiError(err);
  }
}
