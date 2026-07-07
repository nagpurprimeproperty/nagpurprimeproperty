import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import { updateStatusSchema } from '@/server/src/modules/property/property.schema.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError, zodErrorResponse } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/admin/properties/:id/status */
export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PATCH', 'properties');
    if (permErr) return permErr;

    await connectDB();
    const body = await req.json();

    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { id } = await params;
    const { status, adminNotes, rejectedReason } = parsed.data;
    const property = await propertyService.updateStatus(id, status, { adminNotes, rejectedReason });
    return NextResponse.json(successResponse(property, `Property ${status.toLowerCase()} successfully`));
  } catch (err) {
    return handleApiError(err);
  }
}
