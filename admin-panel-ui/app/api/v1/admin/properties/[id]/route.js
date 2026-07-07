import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/properties/:id */
export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'properties');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    const property = await propertyService.getProperty(id);
    return NextResponse.json(successResponse(property));
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/v1/admin/properties/:id
 *
 * Accepts JSON body (no file uploads — use POST /api/v1/admin/media first,
 * and DELETE /api/v1/admin/media to remove unwanted files).
 *
 * Body shape:
 * {
 *   title?, listingCategory?, propertyType?, description?,
 *   brokerId?, location?, details?, pricing?, amenities?,
 *   photos: string[],    // complete final list of photo URLs to keep
 *   video:  string|null, // new/kept video URL, or null to clear
 * }
 *
 * The service replaces the stored photos/video with exactly what is sent.
 * Callers are responsible for:
 *   1. Uploading new files via POST /api/v1/admin/media → get new URLs
 *   2. Deleting removed files via DELETE /api/v1/admin/media
 *   3. Sending the final merged URL list here
 */
export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'PUT', 'properties');
    if (permErr) return permErr;

    await connectDB();

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Request body must be JSON.' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const { photos, video, ...rest } = body;

    // photos must be provided and non-empty
    if (!Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { success: false, message: 'photos must be a non-empty array of URL strings.' },
        { status: 400 }
      );
    }

    if (photos.some((p) => typeof p !== 'string' || !p.startsWith('http'))) {
      return NextResponse.json(
        { success: false, message: 'All photo entries must be valid URL strings.' },
        { status: 400 }
      );
    }

    if (photos.length > 15) {
      return NextResponse.json(
        { success: false, message: 'Maximum 15 photos allowed.' },
        { status: 400 }
      );
    }

    if (video !== undefined && video !== null && (typeof video !== 'string' || !video.startsWith('http'))) {
      return NextResponse.json(
        { success: false, message: 'video must be a valid URL string or null.' },
        { status: 400 }
      );
    }

    const property = await propertyService.updatePropertyFromUrls(
      id,
      { ...rest, photos, video: video ?? null }
    );

    return NextResponse.json(successResponse(property, 'Property updated successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/v1/admin/properties/:id */
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'DELETE', 'properties');
    if (permErr) return permErr;

    await connectDB();
    const { id } = await params;
    await propertyService.deleteProperty(id);
    return NextResponse.json(successResponse(null, 'Property deleted successfully'));
  } catch (err) {
    return handleApiError(err);
  }
}