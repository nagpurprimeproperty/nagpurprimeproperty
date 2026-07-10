import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Setting from '@/server/src/models/setting.model.js';
import { requireAuth, requirePermission } from '@/server/src/middlewares/auth.next.js';
import { handleApiError } from '@/server/src/utils/route-helpers.js';

/** GET /api/v1/admin/settings — get current website settings */
export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const perm = await requirePermission(auth.user, 'GET', 'settings');
    if (perm instanceof NextResponse) return perm;

    await connectDB();
    let settings = await Setting.findOne({ key: 'system_settings' }).lean();
    if (!settings) {
      settings = await Setting.create({
        key: 'system_settings',
        isMaintenanceMode: false,
        isComingSoonMode: false,
        maintenanceTitle: 'Under Maintenance',
        maintenanceDescription: 'We are performing scheduled maintenance to improve our platform. We will be back online shortly.',
        maintenanceLiveAt: null,
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    return handleApiError(err);
  }
}

/** PUT /api/v1/admin/settings — update website settings */
export async function PUT(req) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const perm = await requirePermission(auth.user, 'PUT', 'settings');
    if (perm instanceof NextResponse) return perm;

    await connectDB();
    const body = await req.json();

    // Sanitize values
    const updateData = {
      isMaintenanceMode: Boolean(body.isMaintenanceMode),
      isComingSoonMode: Boolean(body.isComingSoonMode),
      maintenanceTitle: (body.maintenanceTitle || 'Under Maintenance').trim(),
      maintenanceDescription: (body.maintenanceDescription || '').trim(),
      maintenanceLiveAt: body.maintenanceLiveAt ? new Date(body.maintenanceLiveAt) : null,
    };

    const settings = await Setting.findOneAndUpdate(
      { key: 'system_settings' },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    return handleApiError(err);
  }
}
