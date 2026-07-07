// app/properties/[slug]/page.jsx — Server Component
import connectDB from '@/server/src/config/db.js'
import propertyService from '@/server/src/modules/property/property.service.js'
import { notFound } from 'next/navigation'
import PropertyDetailClient from './PropertyDetailClient'
import { headers } from 'next/headers'
import { cache } from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com'

// React cache() memoizes DB fetch per-request. Both generateMetadata and the page render call this, resulting in only 1 query.
const getPropertyForRequest = cache(async (slug) => {
  await connectDB()
  let userIp = '127.0.0.1'
  try {
    const headersList = await headers()
    userIp = headersList.get('x-forwarded-for') || '127.0.0.1'
  } catch {}
  return propertyService.getProperty(slug, null, userIp)
})

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const p = await getPropertyForRequest(slug)
    if (!p) return {}
    const desc = (p.description || '').replace(/<[^>]*>/g, '').slice(0, 155)
    const image = p.images?.[0] || p.photos?.[0]
    return {
      title: p.title,
      description: desc,
      keywords: `${p.title}, property in nagpur, ${p.area || ''}, ${p.propertyType || p.type || ''}`,
      alternates: { canonical: `/properties/${slug}` },
      openGraph: {
        title: p.title,
        description: desc,
        url: `/properties/${slug}`,
        type: 'website',
        images: image ? [{ url: image, alt: p.title }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: p.title,
        description: desc,
        images: image ? [image] : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function PropertyPage({ params }) {
  const { slug } = await params

  let property, similar
  try {
    property = await getPropertyForRequest(slug)
  } catch {
    notFound()
  }
  if (!property) notFound()

  try {
    const simRes = await propertyService.getSimilarProperties(property._id)
    similar = Array.isArray(simRes) ? simRes : simRes?.data ?? []
  } catch {
    similar = []
  }

  const broker = property.brokerId ? {
    id: property.brokerId._id || property.brokerId,
    name: property.brokerId.name || 'Broker Partner',
    phone: property.brokerId.mobile || '9876543210',
    whatsapp: property.brokerId.mobile || '9876543210',
    image: property.brokerId.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    agency: property.brokerId.agency || 'Nagpur Prime Partner',
    experience: property.brokerId.experience || 5,
    verified: true
  } : null

  // ── JSON-LD Structured Data ──────────────────────────────────────────────────
  const price = property.pricing?.totalPrice || property.pricing?.startingPrice || property.price
  const image = property.images?.[0] || property.photos?.[0]
  const locality = typeof property.location === 'string'
    ? property.location
    : [property.location?.locality, property.location?.subLocality, property.location?.city].filter(Boolean).join(', ')

  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: (property.description || '').replace(/<[^>]*>/g, '').slice(0, 500),
    url: `${BASE_URL}/properties/${property.slug}`,
    ...(image && { image }),
    ...(price && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality || 'Nagpur',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
      postalCode: '440001',
    },
    ...(property.reraNumber && { identifier: property.reraNumber }),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Properties', item: `${BASE_URL}/properties` },
      { '@type': 'ListItem', position: 3, name: property.title, item: `${BASE_URL}/properties/${property.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PropertyDetailClient
        property={JSON.parse(JSON.stringify(property))}
        broker={JSON.parse(JSON.stringify(broker))}
        similar={JSON.parse(JSON.stringify(similar))}
      />
    </>
  )
}