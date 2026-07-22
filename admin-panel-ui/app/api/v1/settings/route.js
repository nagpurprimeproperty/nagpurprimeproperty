import { NextResponse } from 'next/server';
import connectDB from '@/server/src/config/db.js';
import Setting from '@/server/src/models/setting.model.js';

export async function GET() {
  try {
    await connectDB();
    let settings = await Setting.findOne({ key: 'system_settings' }).lean();
    if (!settings) {
      settings = await Setting.create({
        key: 'system_settings',
        isMaintenanceMode: false,
        isComingSoonMode: false,
        maintenanceTitle: 'Under Maintenance',
        maintenanceDescription: '',
        maintenanceLiveAt: null,
        androidAppLink: '',
        iosAppLink: '',
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('[Admin Public Settings API] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
