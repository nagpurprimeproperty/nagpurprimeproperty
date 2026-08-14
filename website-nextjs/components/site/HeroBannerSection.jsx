// HeroBannerSection — Server Component
// Renders the LCP hero <Image> in SSR HTML so the browser preload scanner
// can discover it immediately — before any JS is parsed or executed.
// Next.js emits fetchpriority="high" + <link rel="preload"> automatically
// when priority=true is used in a Server Component with a known static src.
// Dynamic text/search/stats are handled by HeroBannerClient (client boundary).
import Image from 'next/image'
import HeroBannerClient from './HeroBannerClient'

export default function HeroBannerSection({ initial = {}, popularAreas = [] }) {
  const bannerSrc = initial?.bannerImage || null

  return (
    <>
      {/* Preload real banner image if available */}
      {bannerSrc && (
        <link
          rel="preload"
          as="image"
          href={`/_next/image?url=${encodeURIComponent(bannerSrc)}&w=1920&q=75`}
          fetchPriority="high"
        />
      )}
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Client layer: renders real background image, dynamic text, search card, and trust stats */}
        <HeroBannerClient initial={initial} popularAreas={popularAreas} />
      </section>
    </>
  )
}
