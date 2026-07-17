import connectDB from '@/server/src/config/db.js';
import StaticPage from '@/server/src/modules/static-page/static-page.model.js';
import Area from '@/server/src/modules/area/area.model.js';
import { getOrSet } from '@/server/src/utils/cache.js';
import { FooterClient } from './FooterClient';

export async function Footer() {
  let aboutData = {};
  let areasList = [];
  try {
    const cachedData = await getOrSet('footer:data', async () => {
      await connectDB();
      const [aboutPage, areas] = await Promise.all([
        StaticPage.findOne({ slug: 'about-us' }).lean(),
        Area.find({ isPublished: true }).sort({ name: 1 }).limit(10).lean(),
      ]);
      return {
        aboutPageContent: aboutPage?.content || null,
        areas: areas ? areas.map(a => ({ name: a.name, slug: a.slug, city: a.city })) : [],
      };
    }, 3600); // 1 hour cache

    if (cachedData.aboutPageContent) {
      aboutData = JSON.parse(cachedData.aboutPageContent);
    }
    areasList = cachedData.areas || [];
  } catch (err) {
    console.error('Failed to load data for footer directly from DB:', err);
  }

  return <FooterClient initialAboutData={aboutData} initialAreasList={areasList} />;
}