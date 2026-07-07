import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import { successResponse } from '@/server/src/utils/api-response.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/properties */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'GET', 'properties');
    if (permErr) return permErr;

    await connectDB();
    const { searchParams } = req.nextUrl;

    const result = await propertyService.listProperties({
      search:          searchParams.get('search')          ?? undefined,
      status:          searchParams.get('status')          ?? undefined,
      listingCategory: searchParams.get('listingCategory') ?? undefined,
      propertyType:    searchParams.get('propertyType')    ?? undefined,
      locality:        searchParams.get('locality')        ?? undefined,
      brokerId:        searchParams.get('brokerId')        ?? undefined,
      featured:        searchParams.get('featured')        ?? undefined,
      dateFrom:        searchParams.get('dateFrom')        ?? undefined,
      dateTo:          searchParams.get('dateTo')          ?? undefined,
      page:            Number(searchParams.get('page')  ?? 1),
      limit:           Number(searchParams.get('limit') ?? 10),
    });

    return NextResponse.json(
      successResponse(result.data, 'Properties fetched successfully', {
        total: result.total, page: result.page,
        limit: result.limit, totalPages: result.totalPages,
      })
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/v1/admin/properties
 *
 * Accepts JSON body (no file uploads — use POST /api/v1/admin/media first).
 *
 * Body shape:
 * {
 *   title, listingCategory, propertyType, description,
 *   brokerId, location, details, pricing, amenities,
 *   photos: string[],   // URLs from /api/v1/admin/media
 *   video:  string|null // URL from /api/v1/admin/media
 * }
 */
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const permErr = await requirePermission(auth.user, 'POST', 'properties');
    if (permErr) return permErr;

    await connectDB();

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Request body must be JSON.' },
        { status: 400 }
      );
    }

    const { photos, video, ...rest } = body;

    // Validate photos array
    if (!Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one photo URL is required. Upload photos via POST /api/v1/admin/media first.' },
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

    // Pass pre-uploaded URLs directly — no file buffers needed
    const property = await propertyService.createPropertyFromUrls(
      { ...rest, photos, video: video ?? null }
    );

    return NextResponse.json(
      successResponse(property, 'Property created successfully'),
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}