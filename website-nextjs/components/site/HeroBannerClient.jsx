'use client'

import { useEffect, useState } from 'react'
import HeroSearchCard from './HeroSearchCard'
import { Sparkles } from 'lucide-react'

// Client layer: handles dynamic text (heading/subheading from CMS),
// search card interactivity, and trust stats.
// The hero <Image> is intentionally in the parent Server Component so the
// browser preload scanner can discover it before any JS executes.
export default function HeroBannerClient({ initial = {}, popularAreas = [] }) {
  const [aboutData, setAboutData] = useState(initial)

  useEffect(() => {
    setAboutData(initial)
  }, [initial])

  useEffect(() => {
    // Fallback: if SSR passed empty initial, fetch live CMS config on mount
    if (!initial.bannerHeading) {
      async function load() {
        try {
          const res = await fetch('/api/pages/about-us')
          const json = await res.json()
          if (json.success && json.data?.content) {
            try {
              setAboutData(JSON.parse(json.data.content))
            } catch (parseErr) {
              console.error('Failed to parse about-us content:', parseErr)
            }
          }
        } catch (err) {
          console.error('Failed to load page config on client:', err)
        }
      }
      load()
    }
  }, [initial])

  return (
    <>
      {/* Hero text + search — overlaid on the server-rendered <Image> */}
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        <div className="max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold text-background backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> {aboutData.tagline || "Connecting Buyers with Trusted Brokers"}
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] text-background sm:text-5xl md:text-6xl">
            {aboutData.bannerHeading || "Find your next property in"}{' '}
            <span className="text-primary-glow">{aboutData.bannerHeadingHighlight || "Nagpur"}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-background/85 sm:text-lg">
            {aboutData.bannerSubheading || "Verified flats, plots and villas across Dighori, MIHAN, Wardha Road and more. Direct contact with trusted brokers — no middlemen, no spam."}
          </p>
          <HeroSearchCard popularAreas={popularAreas} />
        </div>
      </div>

      {/* Trust stats — below the hero, uses same live data */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
          {[
            { n: aboutData.stats?.properties || '8K+', l: 'Verified Listings' },
            { n: aboutData.stats?.cities || '17+', l: 'Localities Covered' },
            { n: aboutData.stats?.users || '52K+', l: 'Happy Buyers' },
            { n: aboutData.stats?.brokers || '550+', l: 'Verified Brokers' },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-2xl font-bold text-foreground sm:text-3xl">{s.n}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
