// app/properties/page.jsx — Server Component wrapper (exports SEO metadata)
// Fetch data on server directly from DB, enabling instant LCP and SEO indexing
import { Suspense, cache } from 'react'
import connectDB from '@/server/src/config/db.js'
import propertyService from '@/server/src/modules/property/property.service.js'
import areaService from '@/server/src/modules/area/area.service.js'
import Area from '@/server/src/modules/area/area.model.js'
import PropertiesClient from './PropertiesClient'

const getCachedAreaBySlug = cache(async (slug) => {
  await connectDB()
  return Area.findOne({ slug }).lean()
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com'

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  
  // Resolve filter values for SEO-friendly labels
  let areaName = ''
  if (params.areaSlug) {
    try {
      const areaDoc = await getCachedAreaBySlug(params.areaSlug)
      if (areaDoc) areaName = areaDoc.name
    } catch {}
  }

  const type = params.type || ''
  const bhk = params.bhk ? `${params.bhk} BHK ` : ''
  const cat = params.listingCategory || 'Properties'

  // Build beautiful descriptive titles:
  // e.g. "2 BHK Flat/Apartment for Sale in Dighori, Nagpur"
  let title = ''
  if (bhk || type || areaName) {
    title = `${bhk}${type} ${cat} ${areaName ? `in ${areaName}, ` : ''}Nagpur | Nagpur Prime Property`
  } else {
    title = 'Properties in Nagpur | Buy & Rent Flats, Plots, Villas | Nagpur Prime Property'
  }

  let description = `Browse verified ${bhk || ''}${type || 'real estate'} properties ${areaName ? `in ${areaName}, ` : ''}Nagpur. Contact verified brokers directly. No middlemen, no spam.`

  return {
    title,
    description,
    keywords: 'properties in nagpur, flats in nagpur for sale, plots in nagpur, villas in nagpur, rent flat nagpur, 2 bhk nagpur, 3 bhk nagpur',
    alternates: {
      canonical: '/properties',
    },
    openGraph: {
      title,
      description,
      url: '/properties',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

async function getPropertiesForParams(params) {
  const queryParams = { ...params }

  if (queryParams.type) {
    queryParams.propertyType = queryParams.type
    delete queryParams.type
  }

  if (queryParams.budget) {
    const budgetPresets = {
      '20': [0, 20],
      '50': [20, 50],
      '100': [50, 100],
      '200': [100, 200],
      '201': [200, 200],
    }
    let range = [0, 200]
    if (budgetPresets[queryParams.budget]) {
      range = budgetPresets[queryParams.budget]
    } else if (queryParams.budget.includes('-')) {
      const [min, max] = queryParams.budget.split('-').map(Number)
      if (!isNaN(min) && !isNaN(max)) range = [min, max]
    }
    queryParams.budgetFrom = range[0] * 100000
    queryParams.budgetTo = range[1] * 100000
    delete queryParams.budget
  }

  if (queryParams.areaSlug) {
    const areaDoc = await getCachedAreaBySlug(queryParams.areaSlug)
    if (areaDoc) {
      const escapedName = areaDoc.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      queryParams.locality = { $regex: `^${escapedName}(\\s|,|$)`, $options: 'i' }
    } else {
      queryParams.locality = 'NON_EXISTENT_LOCALITY'
    }
    delete queryParams.areaSlug
  }

  if (queryParams.amenities) {
    queryParams.amenities = queryParams.amenities.split(',').filter(Boolean)
  }

  const result = await propertyService.listProperties(queryParams)
  return {
    data: result.data || [],
    total: result.total || 0,
    page: result.page || 1,
    limit: result.limit || 12,
    totalPages: result.totalPages || 1,
  }
}

export default async function PropertiesPage({ searchParams }) {
  const params = await searchParams
  
  let initialProperties = { data: [], totalPages: 1 }
  let initialAreas = []

  try {
    await connectDB()
    const [props, areas] = await Promise.allSettled([
      getPropertiesForParams(params),
      areaService.listAreas(),
    ])

    initialProperties = props.status === 'fulfilled' ? JSON.parse(JSON.stringify(props.value)) : { data: [], totalPages: 1 }
    initialAreas = areas.status === 'fulfilled' ? JSON.parse(JSON.stringify(areas.value)) : []
  } catch (err) {
    console.error('[PropertiesPage] Failed to fetch server side data:', err?.message)
  }

  // CollectionPage JSON-LD schema for listing page SEO
  const propertiesListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Verified Real Estate Properties in Nagpur',
    description: 'Explore verified properties including flats, plots, villas and offices in Nagpur with direct broker contacts.',
    url: `${BASE_URL}/properties`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (initialProperties.data || []).slice(0, 20).map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: p.title,
        url: `${BASE_URL}/properties/${p.slug}`,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertiesListSchema) }}
      />
      <Suspense fallback={null}>
        <PropertiesClient 
          initialProperties={initialProperties}
          initialAreas={initialAreas}
        />
      </Suspense>
    </>
  )
}
