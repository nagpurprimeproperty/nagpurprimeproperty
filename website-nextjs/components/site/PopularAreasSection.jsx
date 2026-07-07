'use client'
import { useEffect, useState, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

// Skeleton matching the area card shape (aspect-[4/5] with gradient overlay text)
function PopularAreasSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Skeleton className="h-full w-full" />
          {/* Bottom text block skeleton */}
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
            <Skeleton className="h-3 w-12 bg-foreground/10" />
            <Skeleton className="h-5 w-24 bg-foreground/10" />
            <Skeleton className="h-5 w-16 rounded-full bg-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

const PopularAreasSection = memo(function PopularAreasSection({ initial = [] }) {
  const [areas, setAreas] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(initial && initial.length > 0)

  useEffect(() => {
    setAreas(initial)
    setHasLoaded(initial && initial.length > 0)
  }, [initial])

  useEffect(() => {
    if (!hasLoaded) {
      setLoading(true)
      async function load() {
        try {
          const res = await fetch('/api/areas')
          const json = await res.json()
          if (json.success && Array.isArray(json.data)) {
            setAreas(json.data)
          }
        } catch (err) {
          console.error('Failed to load popular areas on client:', err)
        } finally {
          setLoading(false)
          setHasLoaded(true)
        }
      }
      load()
    }
  }, [hasLoaded])

  const popularAreas = areas.slice(0, 4)

  if (loading) return <PopularAreasSkeleton />

  if (popularAreas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Areas are being set up. <Link href="/areas" className="text-primary hover:underline">Browse areas →</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {popularAreas.map((a) => (
        <Link key={a.slug} href={`/areas/${a.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
          {a.banner && (
            <Image
              src={a.banner}
              alt={`Properties in ${a.name}, Nagpur`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-background">
            <div className="text-[11px] uppercase tracking-widest opacity-80">{a.city}</div>
            <h3 className="font-display text-lg font-bold">{a.name}</h3>
            {a.startingPrice && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">From {a.startingPrice}</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
})

export default PopularAreasSection
