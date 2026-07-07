'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Tag, TrendingUp, Star } from 'lucide-react'

/**
 * SeoKeywordsSection
 * ─────────────────────────────────────────────────────────
 * Displays active SEO keywords as clickable chips on the homepage.
 * • Groups keywords by category
 * • Shows featured keywords with a star badge
 * • Tracks clicks via POST /api/keywords/[id]/click (fire-and-forget)
 * • Injects semantic keyword links for SEO crawlers
 */
export default function SeoKeywordsSection({ keywords: initialKeywords = [] }) {
  const [keywords, setKeywords] = useState(initialKeywords)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    setKeywords(initialKeywords)
  }, [initialKeywords])

  useEffect(() => {
    if (initialKeywords.length === 0) {
      async function load() {
        try {
          const res = await fetch('/api/keywords')
          const json = await res.json()
          if (json.success && Array.isArray(json.data)) {
            setKeywords(json.data)
          }
        } catch (err) {
          console.error('Failed to load keywords on client:', err)
        }
      }
      load()
    }
  }, [initialKeywords])

  // Group by category
  const grouped = useMemo(() => {
    const map = {}
    keywords.forEach((kw) => {
      const cat = kw.category || 'General'
      if (!map[cat]) map[cat] = []
      map[cat].push(kw)
    })
    return map
  }, [keywords])

  const categories = ['All', ...Object.keys(grouped)]

  const visible = useMemo(() => {
    if (activeCategory === 'All') return keywords
    return grouped[activeCategory] || []
  }, [activeCategory, keywords, grouped])

  const featured = visible.filter((k) => k.isFeatured)
  const regular = visible.filter((k) => !k.isFeatured)

  const trackClick = (id) => {
    // Fire-and-forget click tracking
    fetch(`/api/keywords/${id}/click`, { method: 'POST' }).catch(() => {})
  }

  if (!keywords.length) return null

  return (
    <section className="border-t border-border bg-gradient-to-b from-secondary/20 to-background px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <Tag className="h-3.5 w-3.5" />
              SEO Keywords
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              Explore Popular Searches in Nagpur
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse properties by popular search topics across Nagpur
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>{keywords.length} search topics</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 2 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card text-foreground hover:border-primary/50 hover:text-primary'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 opacity-60">
                    ({grouped[cat]?.length || 0})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Featured Keywords — larger + star */}
        {featured.length > 0 && (
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500">
              <Star className="h-3 w-3 fill-amber-500" />
              Featured
            </div>
            <div className="flex flex-wrap gap-2.5">
              {featured.map((kw) => (
                <KeywordChip key={kw._id} kw={kw} featured onTrack={trackClick} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Keywords */}
        {regular.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {regular.map((kw) => (
              <KeywordChip key={kw._id} kw={kw} onTrack={trackClick} />
            ))}
          </div>
        )}

        {visible.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No keywords in this category yet.
          </div>
        )}
      </div>
    </section>
  )
}

function KeywordChip({ kw, featured = false, onTrack }) {
  const isExternal = kw.redirectUrl?.startsWith('http')

  const baseClass = featured
    ? `inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer
       border-amber-300 bg-amber-50 text-amber-800
       hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5
       dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white`
    : `inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer
       border-border bg-card text-foreground
       hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-sm hover:-translate-y-0.5`

  const content = (
    <>
      {featured && <Star className="h-3 w-3 fill-amber-500 text-amber-500" />}
      {kw.keyword}
    </>
  )

  if (isExternal) {
    return (
      <a
        href={kw.redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        onClick={() => onTrack(kw._id)}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={kw.redirectUrl}
      className={baseClass}
      onClick={() => onTrack(kw._id)}
    >
      {content}
    </Link>
  )
}
