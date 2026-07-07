// app/blogs/page.jsx — Server Component
import connectDB from '@/server/src/config/db.js'
import blogService from '@/server/src/modules/blog/blog.service.js'
import BlogsClient from './BlogsClient'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com'

export const metadata = {
  title: 'Nagpur Property Blog | Guides, Tips & Locality Insights',
  description: 'Expert buyer guides, investment trends and locality deep-dives for Nagpur real estate. Read the latest property news and tips.',
  keywords: 'nagpur property blog, real estate guides nagpur, property investment nagpur, nagpur locality guide',
  alternates: {
    canonical: '/blogs',
  },
  openGraph: {
    title: 'Nagpur Property Blog | Guides & Insights',
    description: 'Expert buyer guides, investment trends and locality deep-dives for Nagpur real estate.',
    url: '/blogs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nagpur Property Blog | Nagpur Prime Property',
    description: 'Expert property guides and locality insights for Nagpur.',
  },
}

// Revalidate every 2 minutes — blogs update occasionally, ISR reduces DB load
export const revalidate = 120

export default async function BlogsPage() {
  let blogs = []
  try {
    await connectDB()
    const result = await blogService.listBlogs()
    blogs = Array.isArray(result) ? JSON.parse(JSON.stringify(result)) : []
  } catch (err) {
    console.error('[BlogsPage] Failed to load blogs:', err?.message)
    blogs = []
  }

  // CollectionPage JSON-LD schema for listing page SEO
  const blogsListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Nagpur Property Guides & Insights Blog',
    description: 'Expert buyer guides, investment trends, and locality deep-dives for Nagpur real estate.',
    url: `${BASE_URL}/blogs`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: blogs.map((b, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: b.title,
        url: `${BASE_URL}/blogs/${b.slug}`,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogsListSchema) }}
      />
      <BlogsClient blogs={blogs} />
    </>
  )
}
