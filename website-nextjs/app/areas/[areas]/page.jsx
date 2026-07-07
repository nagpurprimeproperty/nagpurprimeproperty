// app/areas/[areas]/page.jsx — Server Component
import connectDB from '@/server/src/config/db.js'
import areaService from '@/server/src/modules/area/area.service.js'
import blogService from '@/server/src/modules/blog/blog.service.js'
import propertyService from '@/server/src/modules/property/property.service.js'
import Area from '@/server/src/modules/area/area.model.js'
import { notFound } from 'next/navigation'
import AreaClient from './AreaClient'
import { cache } from 'react'

export const revalidate = 600

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com'

const getCachedArea = cache(async (slug) => {
  await connectDB()
  return areaService.getAreaBySlug(slug)
})

export async function generateMetadata({ params }) {
  const { areas: slug } = await params
  try {
    const a = await getCachedArea(slug)
    if (!a) return {}
    let desc = a.metaDescription
    if (!desc) {
      const startPriceText = a.startingPrice ? ` with prices starting from ${a.startingPrice}` : ''
      const schoolsCount = Array.isArray(a.schools) ? a.schools.length : 0
      const hospitalsCount = Array.isArray(a.hospitals) ? a.hospitals.length : 0
      const detailsCount = (schoolsCount || hospitalsCount)
        ? ` with access to ${schoolsCount} schools and ${hospitalsCount} hospitals`
        : ''
      desc = `Explore verified properties in ${a.name}, Nagpur${startPriceText}. Browse flats, plots and villas in ${a.name}${detailsCount}, complete with locality maps and direct broker contacts.`
    }
    return {
      title: a.metaTitle || `${a.name} — Properties, Prices & Locality Guide`,
      description: desc,
      keywords: `${a.name} nagpur, property in ${a.name}, flats in ${a.name}, plots in ${a.name}, ${a.name} real estate`,
      alternates: { canonical: `/areas/${slug}` },
      openGraph: {
        title: a.metaTitle || `${a.name} | Nagpur Prime Property`,
        description: desc,
        url: `/areas/${slug}`,
        type: 'website',
        images: a.banner ? [{ url: a.banner, alt: `${a.name} area in Nagpur` }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: a.metaTitle || `${a.name} | Nagpur Prime Property`,
        description: desc,
        images: a.banner ? [a.banner] : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function AreaPage({ params }) {
  const { areas: slug } = await params

  // Load the area — 404 if not found or unpublished
  let area
  try {
    area = await getCachedArea(slug)
  } catch {
    notFound()
  }
  if (!area) notFound()

  // Properties in this area (filtered by areaSlug → resolved directly to locality name)
  let areaProps = []
  try {
    const escapedName = area.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const localityRegex = { $regex: `^${escapedName}(\\s|,|$)`, $options: 'i' }
    const propsResult = await propertyService.listProperties({ locality: localityRegex, limit: '6' })
    areaProps = Array.isArray(propsResult) ? propsResult : propsResult?.data ?? []
  } catch (err) {
    console.error('[AreaPage] Failed to load area properties:', err?.message)
    areaProps = []
  }

  // Related areas
  let related = []
  try {
    const allAreas = await areaService.listAreas()
    related = Array.isArray(allAreas)
      ? allAreas.filter((x) => x.slug !== slug).slice(0, 4)
      : []
  } catch {
    related = []
  }

  // Recent blogs for the sidebar
  let blogs = []
  try {
    const blogsResult = await blogService.listBlogs({ limit: 3 })
    blogs = Array.isArray(blogsResult) ? blogsResult : blogsResult?.data ?? []
  } catch {
    blogs = []
  }

  // Strip HTML tags from FAQ answers for plain-text schema (Google prefers plain text)
  const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  // FAQPage JSON-LD — makes FAQs appear as rich results in Google
  const faqSchema = area.faqs && area.faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: area.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.a) },
        })),
      }
    : null

  // BreadcrumbList JSON-LD — improves SERP display with breadcrumb path
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Areas', item: `${BASE_URL}/areas` },
      { '@type': 'ListItem', position: 3, name: area.name, item: `${BASE_URL}/areas/${area.slug}` },
    ],
  }

  // Place schema — signals this is a geographic locality page
  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${area.name}, Nagpur`,
    description: area.metaDescription || `Properties and real estate in ${area.name}, Nagpur`,
    url: `${BASE_URL}/areas/${area.slug}`,
    ...(area.banner && { image: area.banner }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: area.name,
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    containedInPlace: {
      '@type': 'City',
      name: 'Nagpur',
    },
  }

  return (
    <>
      {/* JSON-LD Schemas for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <AreaClient
        area={JSON.parse(JSON.stringify(area))}
        props={JSON.parse(JSON.stringify(areaProps))}
        related={JSON.parse(JSON.stringify(related))}
        blogs={JSON.parse(JSON.stringify(blogs))}
      />
    </>
  )
}