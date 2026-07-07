import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/admin/properties/:id/featured */
export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PATCH', 'properties');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;

    let property;
    let body = {};
    try { body = await req.json(); } catch { /* empty body is fine — toggle */ }

    if (typeof body?.featured === 'boolean') {
      property = await propertyService.setFeatured(id, body.featured);
    } else {
      property = await propertyService.toggleFeatured(id);
    }

    const label = property.featured ? 'marked as featured' : 'removed from featured';
    return NextResponse.json(successResponse(property, `Property ${label}`));
  } catch (err) {
    return handleApiError(err);
  }
}
