// app/page.jsx — Async Server Component
import connectDB from '@/server/src/config/db.js'
import areaService from '@/server/src/modules/area/area.service.js'
import blogService from '@/server/src/modules/blog/blog.service.js'
import StaticPage from '@/server/src/modules/static-page/static-page.model.js'
import propertyService from '@/server/src/modules/property/property.service.js'
import keywordService from '@/server/src/modules/keyword/keyword.service.js'
import { LocalityChart } from '@/components/site/LocalityChart'
import Link from 'next/link'
import Image from 'next/image'
import AppDownloadButton from '@/components/site/AppDownloadButton'
import { Building2, Shield, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
// HeroBannerSection is above-the-fold (LCP) — keep eager, no dynamic()
import HeroBannerSection from '@/components/site/HeroBannerSection'
import { cache } from 'react'
import dynamic from 'next/dynamic'

// ── Below-fold sections: code-split into separate JS chunks ──────────────────
// These are 'use client' components with their own dependency trees.
// Deferring them reduces the initial JS payload the browser must parse & execute.
const FeaturedPropertiesSection = dynamic(
  () => import('@/components/site/FeaturedPropertiesSection'),
  { loading: () => <Skeleton className="h-64 w-full rounded-2xl" /> }
)
const PopularAreasSection = dynamic(
  () => import('@/components/site/PopularAreasSection'),
  { loading: () => <Skeleton className="h-48 w-full rounded-2xl" /> }
)
const LatestBlogsSection = dynamic(
  () => import('@/components/site/LatestBlogsSection'),
  { loading: () => <Skeleton className="h-48 w-full rounded-2xl" /> }
)
const SeoKeywordsSection = dynamic(
  () => import('@/components/site/SeoKeywordsSection'),
  { loading: () => <Skeleton className="h-40 w-full rounded-2xl" /> }
)

const getCachedKeywords = cache(async () => {
  await connectDB()
  return keywordService.getActiveKeywords()
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com'

export const revalidate = 60 // ISR — revalidate homepage every 60 seconds

export async function generateMetadata() {
  let keywords = []
  try {
    const kwRes = await getCachedKeywords()
    keywords = Array.isArray(kwRes) ? kwRes : []
  } catch {}
  const topKeywords = keywords.slice(0, 20).map((k) => k.keyword).join(', ')
  return {
    title: 'Nagpur Prime Property — Verified Flats, Plots & Villas in Nagpur',
    description: 'Discover 1000+ verified flats, plots and villas in Nagpur. Direct contact with trusted brokers — no middlemen, no spam. Browse Dighori, MIHAN, Wardha Road and more.',
    keywords: topKeywords || 'property in nagpur, flats in nagpur, plots in nagpur, villas in nagpur',
    alternates: { canonical: '/' },
    openGraph: {
      title: 'Nagpur Prime Property — Verified Flats, Plots & Villas',
      description: 'Discover 1000+ verified properties in Nagpur. Direct contact with trusted brokers.',
      url: '/',
      type: 'website',
    },
  }
}


export default async function HomePage() {
  // Load areas, blogs, settings, and keywords directly from MongoDB
  let areas = [], blogs = [], featured = [], aboutData = {}, keywords = []

  try {
    await connectDB()
    const [areasRes, blogsRes, aboutRes, propsRes, kwRes] = await Promise.allSettled([
      areaService.listAreas(),
      blogService.listBlogs({ limit: 3 }),
      StaticPage.findOne({ slug: 'about-us' }).lean(),
      propertyService.listProperties({ featured: 'true', limit: '6' }),
      getCachedKeywords(),
    ])
    
    areas = areasRes.status === 'fulfilled' && Array.isArray(areasRes.value) ? JSON.parse(JSON.stringify(areasRes.value)) : []
    blogs = blogsRes.status === 'fulfilled' && Array.isArray(blogsRes.value) ? JSON.parse(JSON.stringify(blogsRes.value)) : []
    featured = propsRes.status === 'fulfilled' && propsRes.value
      ? JSON.parse(JSON.stringify(propsRes.value.data ?? propsRes.value ?? []))
      : []
    keywords = kwRes.status === 'fulfilled' && Array.isArray(kwRes.value) ? JSON.parse(JSON.stringify(kwRes.value)) : []

    if (aboutRes.status === 'fulfilled' && aboutRes.value?.content) {
      try {
        aboutData = JSON.parse(aboutRes.value.content)
      } catch {
        aboutData = {}
      }
    }
  } catch (err) {
    console.error('[HomePage] initialization error:', err?.message)
  }

  const popularAreas = areas.slice(0, 4)
  const latestBlogs  = blogs.slice(0, 3)

  // ── JSON-LD Structured Data for Homepage ────────────────────────────────────
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness', 'RealEstateAgent'],
    name: 'Nagpur Prime Property',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.jpeg`,
    image: `${BASE_URL}/logo.jpeg`,
    description: 'Find 1000+ verified flats, plots and villas in Nagpur. Direct contact with trusted brokers.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nagpur',
      addressRegion: 'Maharashtra',
      postalCode: '440001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 21.1458,
      longitude: 79.0882,
    },
    areaServed: { '@type': 'City', name: 'Nagpur' },
    sameAs: [],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nagpur Prime Property',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/properties?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <div>
      {/* ── HERO & TRUST STATS ── */}
      <HeroBannerSection initial={aboutData} popularAreas={popularAreas} />

      {/* ── BUDGET CARDS ── */}
      <Section kicker="By Budget" title="Homes that fit your pocket" subtitle="Hand-picked listings under popular price brackets.">
        <div className="grid gap-4 md:grid-cols-2">
          <BudgetCard label="Under ₹20 Lakh" count={0} tagline="Starter homes & affordable plots" tone="primary" href="/properties?budget=0-20" img="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=70" />
          <BudgetCard label="Under ₹50 Lakh" count={0} tagline="2 BHK flats with full amenities" tone="dark" href="/properties?budget=0-50" img="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=70" />
        </div>
      </Section>

      {/* ── FEATURED PROPERTIES ── */}
      <Section kicker="Featured" title="Handpicked properties this week" subtitle="Our most-loved listings across Nagpur." action={{ to: '/properties', label: 'View all' }}>
        <FeaturedPropertiesSection initial={featured} />
      </Section>

      {/* ── POPULAR AREAS ── */}
      <Section kicker="Localities" title="Popular areas in Nagpur" subtitle="Each locality has its own story — discover yours." action={{ to: '/areas', label: 'All areas' }}>
        <PopularAreasSection initial={popularAreas} />
      </Section>

      {/* ── WHY US ── */}
      <Section kicker="Why Nagpur Prime Property" title="Buy with confidence, every time">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { Icon: Shield, t: 'Verified Brokers', d: 'Every broker is identity-verified before listing.' },
            { Icon: Building2, t: 'Real Photos Only', d: 'No stock images. What you see is what you get.' },
            { Icon: TrendingUp, t: 'ROI Insights', d: 'Locality investment trends with every listing.' },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                <f.Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── BLOGS ── */}
      <Section kicker="From the blog" title="Nagpur property guides & insights" action={{ to: '/blogs', label: 'All articles' }}>
        <LatestBlogsSection initial={latestBlogs} />
      </Section>

      {/* ── MARKET CHART ── */}
      <Section kicker="Market pulse" title="Nagpur localities at a glance" subtitle="Compare entry-level prices and 4-year growth across the city's hottest pockets.">
        <LocalityChart areas={areas} />
      </Section>

      {/* ── SEO KEYWORDS ── */}
      <SeoKeywordsSection keywords={keywords} />

      {/* ── LIST PROPERTY CTA ── */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-primary p-8 text-primary-foreground shadow-elegant sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">List your property free</h2>
              <p className="mt-2 max-w-xl text-sm opacity-90">Reach 50,000+ verified buyers across Nagpur. Zero listing fee, fast approvals.</p>
            </div>
            <AppDownloadButton />
          </div>
        </div>
      </section>
    </div>
    </>
  )
}

function Section({ kicker, title, subtitle, action, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">{kicker}</div>
          <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && (
          <Link href={action.to} className="hidden text-sm font-semibold text-primary hover:underline sm:inline-flex">
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function BudgetCard({ label, count, tagline, tone, href, img }) {
  return (
    <Link href={href} className="group relative flex h-44 overflow-hidden rounded-2xl shadow-soft">
      {img && (
        <Image
          src={img}
          alt={label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      )}
      <div className={`absolute inset-0 ${tone === 'primary' ? 'bg-gradient-to-r from-primary/95 via-primary/70 to-transparent' : 'bg-gradient-to-r from-foreground/95 via-foreground/70 to-transparent'}`} />
      <div className="relative flex w-full items-end p-6 text-background">
        <div>
          <div className="text-xs uppercase tracking-widest opacity-90">{tagline}</div>
          <div className="mt-1 font-display text-2xl font-bold sm:text-3xl">{label}</div>
          <div className="mt-1 text-sm opacity-90">Browse listings →</div>
        </div>
      </div>
    </Link>
  )
}