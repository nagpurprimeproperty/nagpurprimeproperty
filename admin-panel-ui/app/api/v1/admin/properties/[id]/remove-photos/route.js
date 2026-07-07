import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** PATCH /api/v1/admin/properties/:id/remove-photos */
export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PATCH', 'properties');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const { photoUrls } = await req.json();

    if (!Array.isArray(photoUrls) || photoUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Provide an array of photoUrls to remove' },
        { status: 400 }
      );
    }

    const property = await propertyService.removePhotos(id, photoUrls);
    return NextResponse.json(successResponse(property, 'Photos removed successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}
