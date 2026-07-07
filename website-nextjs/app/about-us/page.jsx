// app/about-us/page.jsx — Server Component
// Reads about-us data from DB (same JSON structure used by admin editor & footer)
import connectDB from '@/server/src/config/db.js'
import StaticPage from '@/server/src/modules/static-page/static-page.model.js'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Shield, Building2, TrendingUp, Users, MapPin, Phone, Mail, Globe, CheckCircle2, ArrowRight } from 'lucide-react'

export const revalidate = 60 // ISR — revalidate every 60 seconds

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nagpurprimeproperty.com'

export async function generateMetadata() {
  try {
    await connectDB()
    const page = await StaticPage.findOne({ slug: 'about-us', isPublished: true }).lean()
    if (!page) return {}
    let data = {}
    try { data = JSON.parse(page.content) } catch {}
    return {
      title: page.metaTitle || 'About Us — Nagpur Prime Property',
      description: page.metaDescription || data.mission?.slice(0, 155) || 'Learn about Nagpur Prime Property — Nagpur\'s trusted real estate marketplace.',
      alternates: { canonical: '/about-us' },
      openGraph: {
        title: page.metaTitle || 'About Us | Nagpur Prime Property',
        description: page.metaDescription || data.mission?.slice(0, 155) || '',
        url: '/about-us',
        type: 'website',
        images: data.bannerImage ? [{ url: data.bannerImage, alt: 'About Nagpur Prime Property' }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: page.metaTitle || 'About Us | Nagpur Prime Property',
        description: page.metaDescription || data.mission?.slice(0, 155) || '',
        images: data.bannerImage ? [data.bannerImage] : [],
      },
    }
  } catch {
    return { title: 'About Us | Nagpur Prime Property' }
  }
}

export default async function AboutUsPage() {
  let aboutData = null
  let pageTitle = 'About Us'

  try {
    await connectDB()
    const page = await StaticPage.findOne({ slug: 'about-us', isPublished: true }).lean()
    if (page?.content) {
      try { aboutData = JSON.parse(page.content) } catch {}
      if (page.title) pageTitle = page.title
    }
  } catch (err) {
    console.error('[AboutUsPage] Failed to load from DB:', err?.message)
  }

  if (!aboutData) notFound()

  const {
    tagline,
    mission,
    whatWeOffer = [],
    stats = {},
    contactInfo = {},
    bannerImage,
    bannerHeading,
    bannerHeadingHighlight,
    bannerSubheading,
  } = aboutData

  // JSON-LD Organization schema
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness', 'RealEstateAgent'],
    name: 'Nagpur Prime Property',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.jpeg`,
    description: mission || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: contactInfo.address || '',
      addressLocality: 'Nagpur',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contactInfo.phone || '',
      email: contactInfo.email || '',
      contactType: 'customer service',
    },
    sameAs: [
      contactInfo.facebook,
      contactInfo.instagram,
      contactInfo.youtube,
    ].filter(Boolean),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'About Us', item: `${BASE_URL}/about-us` },
    ],
  }

  const statItems = [
    { value: stats.properties || '1,200+', label: 'Verified Listings' },
    { value: stats.brokers || '100+', label: 'Trusted Brokers' },
    { value: stats.users || '350+', label: 'Happy Buyers' },
    { value: stats.cities || '60+', label: 'Localities Covered' },
  ]

  const whyItems = [
    { Icon: Shield, title: 'Verified Brokers', desc: 'Every broker is identity-verified before they can list properties.' },
    { Icon: Building2, title: 'Real Photos Only', desc: 'No stock images. What you see is exactly what you get.' },
    { Icon: TrendingUp, title: 'ROI Insights', desc: 'Locality investment trends and price history with every listing.' },
    { Icon: Users, title: 'Direct Contact', desc: 'Connect directly with brokers — no middlemen, no spam calls.' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div>
        {/* ── HERO ── */}
        <section className="relative overflow-hidden min-h-[420px] flex items-center">
          {bannerImage && (
            <Image
              src={bannerImage}
              alt="About Nagpur Prime Property"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/60 to-foreground/90" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="max-w-3xl">
              {tagline && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold text-background backdrop-blur">
                  {tagline}
                </span>
              )}
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-background sm:text-5xl md:text-6xl">
                {bannerHeading || 'About'}{' '}
                {bannerHeadingHighlight && (
                  <span className="text-primary-glow">{bannerHeadingHighlight}</span>
                )}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-background/85 sm:text-lg">
                {bannerSubheading || mission}
              </p>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="border-y border-border bg-secondary/40">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
            {statItems.map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold text-primary sm:text-3xl">{s.value}</div>
                <div className="text-xs text-muted-foreground sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MISSION ── */}
        {mission && (
          <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Our Mission</div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-foreground mb-6">
              Why we built Nagpur Prime Property
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {mission}
            </p>
          </section>
        )}

        {/* ── WHAT WE OFFER ── */}
        {whatWeOffer.length > 0 && (
          <section className="bg-secondary/30 border-y border-border">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 text-center">What We Offer</div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl text-center text-foreground mb-10">
                Everything you need to find the right property
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {whatWeOffer.filter(Boolean).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── WHY TRUST US ── */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 text-center">Why Choose Us</div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl text-center text-foreground mb-10">
            Buy with confidence, every time
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyItems.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT INFO ── */}
        {(contactInfo.address || contactInfo.phone || contactInfo.email) && (
          <section className="bg-secondary/30 border-t border-border">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 text-center">Get In Touch</div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl text-center text-foreground mb-10">
                We'd love to hear from you
              </h2>
              <div className="flex flex-wrap justify-center gap-5">
                {contactInfo.address && (
                  <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-soft w-full sm:w-auto sm:min-w-[240px] sm:max-w-[320px] flex-1">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Address</div>
                      <div className="text-sm text-foreground break-words">{contactInfo.address}</div>
                    </div>
                  </div>
                )}
                {contactInfo.phone && (
                  <a href={`tel:${contactInfo.phone}`} className="flex items-start gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-soft w-full sm:w-auto sm:min-w-[240px] sm:max-w-[320px] flex-1 hover:border-primary transition-colors group">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-colors">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Phone</div>
                      <div className="text-sm font-semibold text-foreground break-all">{contactInfo.phone}</div>
                    </div>
                  </a>
                )}
                {contactInfo.email && (
                  <a href={`mailto:${contactInfo.email}`} className="flex items-start gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-soft w-full sm:w-auto sm:min-w-[240px] sm:max-w-[320px] flex-1 hover:border-primary transition-colors group">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Email</div>
                      <div className="text-sm font-semibold text-foreground break-all">{contactInfo.email}</div>
                    </div>
                  </a>
                )}
                {contactInfo.website && (
                  <a href={contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-soft w-full sm:w-auto sm:min-w-[240px] sm:max-w-[320px] flex-1 hover:border-primary transition-colors group">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-colors">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Website</div>
                      <div className="text-sm font-semibold text-foreground break-all">{contactInfo.website}</div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-primary p-8 text-primary-foreground shadow-elegant sm:p-12">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to find your property?</h2>
                <p className="mt-2 max-w-xl text-sm opacity-90">Browse 1,200+ verified listings across Nagpur with direct broker contact.</p>
              </div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/30 transition-colors shrink-0"
              >
                Browse Properties <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
