// app/sitemap.js — Dynamic XML Sitemap (Next.js App Router)
// Generates sitemap.xml automatically from live DB data
import connectDB from '@/server/src/config/db.js'
import Property from '@/server/src/modules/property/property.model.js'
import Blog from '@/server/src/modules/blog/blog.model.js'
import Area from '@/server/src/modules/area/area.model.js'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com'

export async function generateSitemaps() {
  try {
    await connectDB()
    const count = await Property.countDocuments({ status: 'Active' })
    const numSitemaps = Math.max(1, Math.ceil(count / 5000))
    return Array.from({ length: numSitemaps }, (_, i) => ({ id: i }))
  } catch (err) {
    console.error('[generateSitemaps] Failed to query count:', err?.message)
    return [{ id: 0 }]
  }
}

export default async function sitemap({ id }) {
  const idNum = parseInt(id, 10) || 0
  const now = new Date().toISOString()

  // Fetch dynamic data directly from DB in parallel — fail gracefully
  let properties = [], blogs = [], areas = []
  try {
    await connectDB()
    
    const propQuery = Property.find({ status: 'Active' }, 'slug updatedAt')
      .skip(idNum * 5000)
      .limit(5000)
      .lean()

    if (idNum === 0) {
      const [propsRes, blogsRes, areasRes] = await Promise.allSettled([
        propQuery,
        Blog.find({ isPublished: true }, 'slug updatedAt').lean(),
        Area.find({ isPublished: true }, 'slug').lean(),
      ])

      properties = propsRes.status === 'fulfilled' ? propsRes.value : []
      blogs = blogsRes.status === 'fulfilled' ? blogsRes.value : []
      areas = areasRes.status === 'fulfilled' ? areasRes.value : []
    } else {
      properties = await Property.find({ status: 'Active' }, 'slug updatedAt')
        .skip(idNum * 5000)
        .limit(5000)
        .lean()
    }
  } catch (err) {
    console.error('[Sitemap] Failed to query DB:', err?.message)
  }

  // Static pages (only on the first sitemap)
  const staticPages = idNum === 0 ? [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/properties`, lastModified: now, changeFrequency: 'hourly', priority: 0.95 },
    { url: `${BASE_URL}/areas`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE_URL}/blogs`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/about-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms-and-conditions`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ] : []

  // Property pages for this chunk
  const propertyUrls = properties
    .filter((p) => p?.slug)
    .map((p) => ({
      url: `${BASE_URL}/properties/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt).toISOString() : now,
      changeFrequency: 'weekly',
      priority: 0.85,
    }))

  // Blog pages (only on first sitemap)
  const blogUrls = idNum === 0 ? blogs
    .filter((b) => b?.slug)
    .map((b) => ({
      url: `${BASE_URL}/blogs/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt).toISOString() : now,
      changeFrequency: 'monthly',
      priority: 0.75,
    })) : []

  // Area pages (only on first sitemap)
  const areaUrls = idNum === 0 ? areas
    .filter((a) => a?.slug)
    .map((a) => ({
      url: `${BASE_URL}/areas/${a.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })) : []

  return [...staticPages, ...propertyUrls, ...blogUrls, ...areaUrls]
}
