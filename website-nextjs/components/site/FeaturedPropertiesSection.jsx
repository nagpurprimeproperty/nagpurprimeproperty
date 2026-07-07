'use client'
import { useEffect, useState, useMemo, memo } from 'react'
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard'

// Skeleton shown while properties load
function FeaturedPropertiesSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  )
}

const FeaturedPropertiesSection = memo(function FeaturedPropertiesSection({ initial = [] }) {
  const [properties, setProperties] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(initial && initial.length > 0)

  useEffect(() => {
    setProperties(initial)
    setHasLoaded(initial && initial.length > 0)
  }, [initial])

  useEffect(() => {
    if (!hasLoaded) {
      setLoading(true)
      async function load() {
        try {
          const res = await fetch('/api/properties?featured=true&limit=6')
          const json = await res.json()
          if (json.success && Array.isArray(json.data)) {
            setProperties(json.data)
          }
        } catch (err) {
          console.error('Failed to load featured properties on client:', err)
        } finally {
          setLoading(false)
          setHasLoaded(true)
        }
      }
      load()
    }
  }, [hasLoaded])

  // Stable memoized list — avoids re-rendering cards when parent re-renders
  const cards = useMemo(
    () => properties.map((p, i) => <PropertyCard key={p._id || p.id} p={p} index={i} />),
    [properties]
  )

  if (loading) return <FeaturedPropertiesSkeleton />

  if (properties.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        Properties are being added. Check back soon.
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards}
    </div>
  )
})

export default FeaturedPropertiesSection
