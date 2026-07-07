// app/blogs/[slug]/page.jsx — Server Component
import connectDB from '@/server/src/config/db.js'
import blogService from '@/server/src/modules/blog/blog.service.js'
import { notFound } from 'next/navigation'
import BlogDetailClient from './BlogDetailClient'
import { cache } from 'react'

export const revalidate = 600

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com'

const getCachedBlog = cache(async (slug) => {
  await connectDB()
  return blogService.getBlogBySlug(slug)
})

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const b = await getCachedBlog(slug)
    if (!b) return {}
    const desc = (b.excerpt || '').slice(0, 155)
    return {
      title: b.title,
      description: desc,
      keywords: Array.isArray(b.tags) ? b.tags.join(', ') : '',
      alternates: { canonical: `/blogs/${slug}` },
      openGraph: {
        title: b.title,
        description: desc,
        url: `/blogs/${slug}`,
        type: 'article',
        publishedTime: b.date,
        authors: b.author ? [b.author] : [],
        images: b.cover ? [{ url: b.cover, alt: b.title }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: b.title,
        description: desc,
        images: b.cover ? [b.cover] : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function BlogPage({ params }) {
  const { slug } = await params

  // Load the blog — 404 if not found or unpublished
  let blog
  try {
    blog = await getCachedBlog(slug)
  } catch {
    notFound()
  }
  if (!blog) notFound()

  // Related blogs
  let related = []
  try {
    const all = await blogService.listBlogs()
    related = Array.isArray(all)
      ? all.filter((x) => x.slug !== blog.slug).slice(0, 3)
      : []
  } catch {
    related = []
  }

  // ── JSON-LD Structured Data ──────────────────────────────────────────────────
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt || '',
    url: `${BASE_URL}/blogs/${blog.slug}`,
    ...(blog.cover && { image: blog.cover }),
    ...(blog.date && { datePublished: new Date(blog.date).toISOString() }),
    ...(blog.updatedAt && { dateModified: new Date(blog.updatedAt).toISOString() }),
    author: {
      '@type': 'Person',
      name: blog.author || 'Nagpur Prime Property',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nagpur Prime Property',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.jpeg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blogs/${blog.slug}`,
    },
    keywords: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blogs` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: `${BASE_URL}/blogs/${blog.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogDetailClient
        blog={JSON.parse(JSON.stringify(blog))}
        related={JSON.parse(JSON.stringify(related))}
      />
    </>
  )
}