import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import propertyService from '@/server/src/modules/property/property.service.js';
import { getAuthUser } from '@/server/src/middlewares/auth.next.js';
import mongoose from 'mongoose';
import Area from '@/server/src/modules/area/area.model.js';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    // Convert searchParams to a plain object supporting arrays
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (key === 'amenities') {
        if (!params.amenities) params.amenities = [];
        if (value.includes(',')) {
          params.amenities.push(...value.split(',').map((v) => v.trim()).filter(Boolean));
        } else {
          params.amenities.push(value);
        }
      } else {
        params[key] = value;
      }
    }

    // Translate frontend filter keys to backend repository keys
    if (params.type) {
      params.propertyType = params.type;
      delete params.type;
    }
    if (params.minPrice) {
      params.budgetFrom = params.minPrice;
      delete params.minPrice;
    }
    if (params.maxPrice) {
      params.budgetTo = params.maxPrice;
      delete params.maxPrice;
    }
    if (params.areaSlug) {
      // Resolve areaSlug to locality name
      const areaDoc = await Area.findOne({ slug: params.areaSlug }).lean();
      if (areaDoc) {
        const escapedName = areaDoc.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        params.locality = { $regex: `^${escapedName}(\\s|,|$)`, $options: 'i' };
      } else {
        params.locality = 'NON_EXISTENT_LOCALITY';
      }
      delete params.areaSlug;
    }

    const user = getAuthUser(req);
    const result = await propertyService.listProperties(params, user?.id);

    // ── HTTP caching headers ────────────────────────────────────────────────────
    // Authenticated requests may have personalised data — never cache publicly.
    // Public browse requests: CDN/browser serves stale for up to 5 min while
    // revalidating in background (stale-while-revalidate). This dramatically
    // reduces DB hits when many users browse the same filter page.
    const isAuthenticated = !!req.headers.get('authorization');
    const cacheControl = isAuthenticated
      ? 'private, no-cache, no-store'
      : 'public, s-maxage=60, stale-while-revalidate=300';

    const response = NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
    response.headers.set('Cache-Control', cacheControl);
    return response;
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal error' }, { status: 500 });
  }
}

