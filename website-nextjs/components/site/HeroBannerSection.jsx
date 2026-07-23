// HeroBannerSection — Server Component
// Renders the LCP hero <Image> in SSR HTML so the browser preload scanner
// can discover it immediately — before any JS is parsed or executed.
// Next.js emits fetchpriority="high" + <link rel="preload"> automatically
// when priority=true is used in a Server Component with a known static src.
// Dynamic text/search/stats are handled by HeroBannerClient (client boundary).
import Image from 'next/image'
import HeroBannerClient from './HeroBannerClient'

const DEFAULT_BANNER = 'https://s3-noi.aces3.ai/nagpurpropertytest/blog-media/1781857741869-839061532.png'

export default function HeroBannerSection({ initial = {}, popularAreas = [] }) {
  const bannerSrc = initial.bannerImage || DEFAULT_BANNER

  return (
    <>
      {/* Explicit preload hint — hoisted to <head> by Next.js App Router.
          Browser starts fetching the LCP image before the body is parsed. */}
      <link
        rel="preload"
        as="image"
        href={`/_next/image?url=${encodeURIComponent(bannerSrc)}&w=1920&q=75`}
        fetchPriority="high"
      />
      {/* ── HERO — image is server-rendered for instant LCP ── */}
      <section className="relative overflow-hidden">
        <Image
          src={bannerSrc}
          alt="Nagpur skyline — find verified properties in Nagpur"
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/55 to-foreground/85" />
        {/* Client layer: dynamic text, search card, and trust stats */}
        <HeroBannerClient initial={initial} popularAreas={popularAreas} />
      </section>
    </>
  )
}
