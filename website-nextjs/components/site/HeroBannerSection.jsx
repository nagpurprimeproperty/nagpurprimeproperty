'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import HeroSearchCard from './HeroSearchCard'
import { Sparkles } from 'lucide-react'

export default function HeroBannerSection({ initial = {}, popularAreas = [] }) {
  const [aboutData, setAboutData] = useState(initial)

  useEffect(() => {
    setAboutData(initial)
  }, [initial])

  useEffect(() => {
    // If build compiled empty aboutData, fetch the custom live config on mount
    if (!initial.bannerHeading) {
      async function load() {
        try {
          const res = await fetch('/api/pages/about-us')
          const json = await res.json()
          if (json.success && json.data?.content) {
            try {
              const parsed = JSON.parse(json.data.content)
              setAboutData(parsed)
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
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <Image
          src={aboutData.bannerImage || "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1536&q=80"}
          alt="Nagpur skyline — find verified properties in Nagpur"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/55 to-foreground/85" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold text-background backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> {aboutData.tagline || "Nagpur's #1 Property Marketplace"}
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] text-background sm:text-5xl md:text-6xl">
              {aboutData.bannerHeading || "Find your next home in"}{' '}
              {aboutData.bannerHeadingHighlight && (
                <span className="text-primary-glow">{aboutData.bannerHeadingHighlight}</span>
              )}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-background/85 sm:text-lg">
              {aboutData.bannerSubheading || "Verified flats, plots and villas across Dighori, MIHAN, Wardha Road and more. Direct contact with trusted brokers — no middlemen, no spam."}
            </p>
            <HeroSearchCard popularAreas={popularAreas} />
          </div>
        </div>
      </section>

      {/* ── TRUST STATS ── */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
          {[
            { n: aboutData.stats?.properties || '1,200+', l: 'Verified Listings' },
            { n: aboutData.stats?.cities || '60+', l: 'Localities Covered' },
            { n: aboutData.stats?.users || '350+', l: 'Happy Buyers' },
            { n: aboutData.stats?.brokers || '100%', l: 'Verified Brokers' },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-2xl font-bold text-primary sm:text-3xl">{s.n}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
