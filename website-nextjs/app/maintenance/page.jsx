import connectDB from '@/server/src/config/db.js';
import Setting from '@/server/src/models/setting.model.js';
import MaintenanceClientPage from './MaintenanceClientPage';

export const revalidate = 0; // Fetch fresh database settings on every load

export async function generateMetadata() {
  try {
    await connectDB();
    const settings = await Setting.findOne({ key: 'system_settings' }).lean();
    return {
      title: settings?.maintenanceTitle || 'Site Under Maintenance | Nagpur Prime Property',
      description: settings?.maintenanceDescription || 'Our website is undergoing scheduled maintenance.',
      robots: { index: false, follow: false }, // Don't index maintenance pages
    };
  } catch {
    return {
      title: 'Site Under Maintenance | Nagpur Prime Property',
      robots: { index: false, follow: false },
    };
  }
}

export default async function MaintenancePage() {
  let settings = null;
  try {
    await connectDB();
    settings = await Setting.findOne({ key: 'system_settings' }).lean();
  } catch (err) {
    console.error('Error loading settings in maintenance page:', err.message);
  }

  const serializedSettings = {
    maintenanceTitle: settings?.maintenanceTitle || 'Under Maintenance',
    maintenanceDescription: settings?.maintenanceDescription || 'We are performing scheduled maintenance to improve our platform. We will be back online shortly.',
    maintenanceLiveAt: settings?.maintenanceLiveAt ? settings.maintenanceLiveAt.toISOString() : null,
  };

  return <MaintenanceClientPage settings={serializedSettings} />;
}
