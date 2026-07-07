// app/areas/page.jsx — Server Component
import connectDB from '@/server/src/config/db.js'
import areaService from '@/server/src/modules/area/area.service.js'
import AreasClient from './AreasClient'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com'

export const metadata = {
  title: 'Areas & Localities in Nagpur | Explore Neighbourhoods',
  description: 'Explore all localities and areas in Nagpur. Compare prices, amenities and investment potential across Dighori, MIHAN, Wardha Road, Hingna and 60+ more areas.',
  keywords: 'areas in nagpur, localities in nagpur, dighori, mihan nagpur, wardha road nagpur, hingna nagpur, property by area nagpur',
  alternates: { canonical: '/areas' },
  openGraph: {
    title: 'Areas & Localities in Nagpur | Nagpur Prime Property',
    description: 'Explore 60+ localities in Nagpur. Find properties by neighbourhood with price insights.',
    url: '/areas',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Areas & Localities in Nagpur | Nagpur Prime Property',
    description: 'Explore 60+ localities in Nagpur with price and investment insights.',
  },
}

// Revalidate every 5 minutes — areas don't change often, ISR reduces DB load
export const revalidate = 300

export default async function AreasPage() {
  let areas = []
  try {
    await connectDB()
    const result = await areaService.listAreas()
    areas = Array.isArray(result) ? JSON.parse(JSON.stringify(result)) : []
  } catch (err) {
    console.error('[AreasPage] Failed to load areas:', err?.message)
    areas = []
  }

  // CollectionPage JSON-LD schema for listing page SEO
  const areasListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Areas and Localities in Nagpur',
    description: 'A comprehensive list of popular neighbourhoods and real estate investment localities in Nagpur.',
    url: `${BASE_URL}/areas`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: areas.map((a, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: a.name,
        url: `${BASE_URL}/areas/${a.slug}`,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(areasListSchema) }}
      />
      <AreasClient areas={areas} />
    </>
  )
}