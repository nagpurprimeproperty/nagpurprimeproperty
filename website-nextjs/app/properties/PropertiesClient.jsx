// app/properties/PropertiesClient.jsx  — Client Component using TanStack Query + URL-synced filters
'use client'
import { useState, useCallback, useMemo, Suspense, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Filter, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { useProperties } from '@/lib/hooks/useProperties'
import { useAreas } from '@/lib/hooks/useAreas'
import { PropertyCard, PropertyCardSkeleton } from '@/components/site/PropertyCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LocationSearch } from '@/components/site/LocationSearch'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { PropertyFilters } from '@/components/site/PropertyFilters'

function getPaginationRange(current, total) {
  const range = []
  const delta = 1
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }
  const result = []
  let l
  for (const i of range) {
    if (l !== undefined) {
      if (i - l === 2) {
        result.push(l + 1)
      } else if (i - l > 2) {
        result.push('...')
      }
    }
    result.push(i)
    l = i
  }
  return result
}

const MapPreview = dynamic(() => import('@/components/site/MapPreview').then((mod) => mod.MapPreview), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl bg-muted" />,
})

const MapSearchDialog = dynamic(() => import('@/components/site/MapSearchDialog').then((mod) => mod.MapSearchDialog), {
  ssr: false,
})

// ── Helpers ────────────────────────────────────────────────────────────────────
const budgetPresets = {
  '20': [0, 20],
  '50': [20, 50],
  '100': [50, 100],
  '200': [100, 200],
  '201': [200, 200],
}

function parseBudgetParam(param) {
  if (param && budgetPresets[param]) return budgetPresets[param]
  if (param && param.includes('-')) {
    const [min, max] = param.split('-').map(Number)
    if (!isNaN(min) && !isNaN(max)) return [min, max]
  }
  return [0, 200]
}

function budgetToParam(budget) {
  if (budget[0] === 0 && budget[1] === 200) return null
  return `${budget[0]}-${budget[1]}`
}

// ── Page export ────────────────────────────────────────────────────────────────
export default function PropertiesPage({ initialProperties, initialAreas }) {
  return (
    <Suspense fallback={<PropertiesPageSkeleton />}>
      <PropertiesContent initialProperties={initialProperties} initialAreas={initialAreas} />
    </Suspense>
  )
}

// ── URL-synced filter logic ─────────────────────────────────────────────────────
function PropertiesContent({ initialProperties, initialAreas }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // ── Read initial state from URL ──────────────────────────────────────────────
  const [budget, setBudget]                 = useState(() => parseBudgetParam(searchParams.get('budget')))
  const [type, setType]                     = useState(() => searchParams.get('type') || null)
  const [bhk, setBhk]                       = useState(() => searchParams.get('bhk') ? Number(searchParams.get('bhk')) : null)
  const [area, setArea]                     = useState(() => searchParams.get('areaSlug') || null)
  const [localQuery, setLocalQuery]         = useState(() => searchParams.get('search') || '')
  const [query, setQuery]                   = useState(() => searchParams.get('search') || '')
  const [listingCategory, setListingCategory] = useState(() => searchParams.get('listingCategory') || null)
  const [selectedAmenities, setSelectedAmenities] = useState(() => {
    const a = searchParams.get('amenities')
    return a ? a.split(',').filter(Boolean) : []
  })
  const [page, setPage] = useState(() => searchParams.get('page') ? Number(searchParams.get('page')) : 1)
  const [isMapOpen, setIsMapOpen] = useState(false)

  // ── Sync state → URL whenever any filter changes ──────────────────────────
  const syncUrl = useCallback((updates) => {
    // Build new params from current URL + updates
    const params = new URLSearchParams(searchParams.toString())

    const set = (key, value) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    }

    if ('budget' in updates)           set('budget', updates.budget)
    if ('type' in updates)             set('type', updates.type)
    if ('bhk' in updates)              set('bhk', updates.bhk !== null ? String(updates.bhk) : null)
    if ('areaSlug' in updates)         set('areaSlug', updates.areaSlug)
    if ('search' in updates)           set('search', updates.search)
    if ('listingCategory' in updates)  set('listingCategory', updates.listingCategory)
    if ('page' in updates)             set('page', updates.page)
    if ('amenities' in updates) {
      const arr = updates.amenities
      arr.length > 0 ? params.set('amenities', arr.join(',')) : params.delete('amenities')
    }

    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [searchParams, router, pathname])

  // ── Debounce localQuery → query & sync URL ──
  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== localQuery) {
        setQuery(localQuery)
        setPage(1)
        syncUrl({ search: localQuery, page: 1 })
      }
    }, 400)
    return () => clearTimeout(t)
  }, [localQuery, query, syncUrl])

  // ── Individual setters that also update URL ────────────────────────────────
  const handleBudget = useCallback((val) => { setBudget(val); setPage(1); syncUrl({ budget: budgetToParam(val), page: 1 }) }, [syncUrl])
  const handleType = useCallback((val) => { setType(val); setPage(1); syncUrl({ type: val, page: 1 }) }, [syncUrl])
  const handleBhk = useCallback((val) => { setBhk(val); setPage(1); syncUrl({ bhk: val, page: 1 }) }, [syncUrl])
  const handleArea = useCallback((val) => { setArea(val); setPage(1); syncUrl({ areaSlug: val, page: 1 }) }, [syncUrl])
  const handleQuery = useCallback((val) => { setLocalQuery(val) }, [])
  const handleListingCategory = useCallback((val) => { setListingCategory(val); setPage(1); syncUrl({ listingCategory: val, page: 1 }) }, [syncUrl])
  const handleAmenities = useCallback((val) => { setSelectedAmenities(val); setPage(1); syncUrl({ amenities: val, page: 1 }) }, [syncUrl])

  const reset = useCallback(() => {
    setBudget([0, 200])
    setType(null)
    setBhk(null)
    setArea(null)
    setLocalQuery('')
    setQuery('')
    setListingCategory(null)
    setSelectedAmenities([])
    setPage(1)
    router.replace(pathname, { scroll: false })
  }, [router, pathname])

  // Sync URL search params back to local state (for back/forward navigation or link transitions)
  useEffect(() => {
    setBudget(parseBudgetParam(searchParams.get('budget')))
    setType(searchParams.get('type') || null)
    setBhk(searchParams.get('bhk') ? Number(searchParams.get('bhk')) : null)
    setArea(searchParams.get('areaSlug') || null)
    setLocalQuery(searchParams.get('search') || '')
    setQuery(searchParams.get('search') || '')
    setListingCategory(searchParams.get('listingCategory') || null)
    const a = searchParams.get('amenities')
    setSelectedAmenities(a ? a.split(',').filter(Boolean) : [])
    setPage(searchParams.get('page') ? Number(searchParams.get('page')) : 1)
  }, [searchParams])

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage)
    syncUrl({ page: newPage })
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }, [syncUrl])

  // ── Build API filters from current state (memoized to avoid query key churn) ────────────
  const filters = useMemo(() => ({
    page,
    limit: 12,
    ...(type              && { type }),
    ...(bhk               && { bhk }),
    ...(area              && { areaSlug: area }),
    ...(query.trim()      && { search: query.trim() }),
    ...(budget[0] > 0     && { minPrice: budget[0] * 100000 }),
    ...(budget[1] < 200   && { maxPrice: budget[1] * 100000 }),
    ...(listingCategory   && { listingCategory }),
    ...(selectedAmenities.length > 0 && { amenities: selectedAmenities }),
  }), [page, type, bhk, area, query, budget, listingCategory, selectedAmenities])

  // ── Seed TanStack Query with server-fetched data ─────────────────────────────
  // initialData: seeds the cache instantly (no loading flash on first visit)
  // initialDataUpdatedAt: 0 marks it as already-stale → one background refresh
  //   happens to validate freshness, but the page is never blank.
  // On 2nd+ visits: cache is warm (staleTime=5min), zero API calls.
  const { data: propData, isLoading, isFetching, isPlaceholderData, isError, refetch } = useProperties(filters, {
    initialData: initialProperties,
    initialDataUpdatedAt: 0,
  })
  const { data: areas = [] } = useAreas({
    initialData: initialAreas,
    initialDataUpdatedAt: 0,
  })

  const properties = Array.isArray(propData)
    ? propData
    : propData?.data ?? []

  const totalPages = propData?.totalPages ?? 1
  const total = propData?.total ?? 0

  // Count active filters for the badge
  const activeFilterCount = [
    budget[0] > 0 || budget[1] < 200,
    !!type,
    !!bhk,
    !!area,
    !!query,
    !!listingCategory,
    selectedAmenities.length > 0,
  ].filter(Boolean).length

  // ── Active filter tags (memoized to prevent recreation) ──────────────────────────
  const activeTags = useMemo(() => {
    const tags = []
    if (listingCategory) tags.push({ label: listingCategory, clear: () => handleListingCategory(null) })
    if (type) tags.push({ label: type, clear: () => handleType(null) })
    if (bhk) tags.push({ label: `${bhk} BHK`, clear: () => handleBhk(null) })
    if (area) {
      const name = areas.find((a) => a.slug === area)?.name || area
      tags.push({ label: name, clear: () => handleArea(null) })
    }
    if (budget[0] > 0 || budget[1] < 200) {
      let label = `₹${budget[0]}L – ₹${budget[1]}L`
      if (budget[1] >= 200) label = `Above ₹${budget[0]}L`
      else if (budget[0] === 0) label = `Under ₹${budget[1]}L`
      tags.push({ label, clear: () => handleBudget([0, 200]) })
    }
    if (query) tags.push({ label: `"${query}"`, clear: () => { setLocalQuery(''); setQuery(''); syncUrl({ search: '' }) } })
    selectedAmenities.forEach((a) =>
      tags.push({ label: a, clear: () => handleAmenities(selectedAmenities.filter((x) => x !== a)) })
    )
    return tags
  }, [listingCategory, type, bhk, area, budget, query, selectedAmenities, areas, handleListingCategory, handleType, handleBhk, handleArea, handleBudget, handleAmenities, syncUrl])

  // ── Desktop sidebar ──
  // Memoize so PropertyFilters (React.memo) only re-renders when a filter value
  // actually changes — not on every keystroke or pagination update.
  const filtersProps = useMemo(() => ({
    budget,
    handleBudget,
    listingCategory,
    handleListingCategory,
    type,
    handleType,
    bhk,
    handleBhk,
    area,
    handleArea,
    areas,
    selectedAmenities,
    handleAmenities,
    reset,
  }), [budget, handleBudget, listingCategory, handleListingCategory, type, handleType,
       bhk, handleBhk, area, handleArea, areas, selectedAmenities, handleAmenities, reset]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Browse</div>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Properties in Nagpur</h1>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {isLoading ? 'Loading...' : `${total} verified listings found`}
        </p>
        <div className="mt-5 grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft md:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <LocationSearch
              value={query}
              onChange={handleQuery}
              onSelect={(s) => { if (s.areaSlug) handleArea(s.areaSlug) }}
              placeholder="Search by locality…"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {areas.map((a) => (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => handleArea(area === a.slug ? null : a.slug)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    area === a.slug
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
          <MapPreview
            properties={properties}
            highlight={area ? areas.find((a) => a.slug === area)?.name : query}
            onSelectLocality={(name) => {
              const foundArea = areas.find((a) => a.name.toLowerCase() === name.toLowerCase())
              if (foundArea) {
                handleArea(area === foundArea.slug ? null : foundArea.slug)
              } else {
                handleQuery(query === name ? '' : name)
              }
            }}
            onExpandMap={() => setIsMapOpen(true)}
            height="aspect-[16/10] md:aspect-auto md:h-full"
            caption="Filter properties by map"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
              </div>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <PropertyFilters {...filtersProps} />
          </div>
        </aside>

        {/* Results area */}
        <div className="min-w-0">
          {/* Mobile filter button */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                <SheetHeader><SheetTitle>Filter properties</SheetTitle></SheetHeader>
                <div className="mt-4">
                  <PropertyFilters {...filtersProps} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active filter tags */}
          {activeTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
              {activeTags.map((tag) => (
                <button
                  key={tag.label}
                  onClick={tag.clear}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
                >
                  {tag.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                Clear all
              </button>
            </div>
          )}
          {/* Show skeletons when: first ever load (no cache + fetching) or data is undefined */}
          {(isLoading || (isFetching && !propData)) ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <h3 className="font-display text-lg font-semibold">Failed to load properties</h3>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <h3 className="font-display text-lg font-semibold">No properties match these filters</h3>
              <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" onClick={reset}>Reset Filters</Button>
                <Link href="/areas"><Button variant="hero">Browse Areas</Button></Link>
              </div>
            </div>
          ) : (
            <div className={cn("transition-opacity duration-200", (isLoading || isPlaceholderData) && "opacity-50 pointer-events-none")}>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((p, i) => <PropertyCard key={p._id || p.id} p={p} index={i} />)}
              </div>
              
              {totalPages > 1 && (
                <Pagination className="mt-10">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (page > 1) handlePageChange(page - 1); }} className={page === 1 ? 'pointer-events-none opacity-50' : ''} />
                    </PaginationItem>
                    {getPaginationRange(page, totalPages).map((p, idx) => (
                      <PaginationItem key={idx}>
                        {p === '...' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink href="#" isActive={page === p} onClick={(e) => { e.preventDefault(); handlePageChange(p); }}>{p}</PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages) handlePageChange(page + 1); }} className={page === totalPages ? 'pointer-events-none opacity-50' : ''} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      </div>

      <MapSearchDialog
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        properties={properties}
        areas={areas}
        currentArea={area}
        onSelectArea={(slug) => handleArea(slug)}
        onSelectLocality={(name) => handleQuery(name)}
      />
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function PropertiesPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-6">
        <Skeleton className="h-4 w-16 bg-muted-foreground/15" />
        <Skeleton className="mt-2 h-9 w-64 bg-muted-foreground/15" />
        <Skeleton className="mt-2 h-4 w-40 bg-muted-foreground/10" />
        <div className="mt-5 grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-muted-foreground/15 rounded-xl" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 bg-muted-foreground/10 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-32 md:h-full w-full bg-muted-foreground/15 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-6">
            <Skeleton className="h-5 w-24 bg-muted-foreground/15" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20 bg-muted-foreground/15" />
                <Skeleton className="h-8 w-full bg-muted-foreground/10 rounded-md" />
              </div>
            ))}
          </div>
        </aside>
        <div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </div>
  )
}