// app/areas/AreasClient.jsx — Client Component (search/sort/pagination logic)
'use client'
import { useMemo, useState, useEffect } from 'react'
import { ArrowRight, MapPin, Search, TrendingUp, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'

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
import { Skeleton } from '@/components/ui/skeleton'
import { useAreas } from '@/lib/hooks/useAreas'

const SORTS = [
  { key: 'popular', label: 'Most popular' },
  { key: 'price-low', label: 'Price: low to high' },
  { key: 'price-high', label: 'Price: high to low' },
  { key: 'name', label: 'Name (A–Z)' },
]

const PER_PAGE = 9

function parsePrice(p) {
  if (!p) return 0
  const num = parseFloat(p.replace(/[^\d.]/g, '')) || 0
  return /cr/i.test(p) ? num * 100 : num
}

export default function AreasClient({ areas: initialAreas = [] }) {
  // localQ: what the input shows (every keystroke)
  // q: debounced value that drives the useMemo filter (200ms after typing stops)
  const [localQ, setLocalQ] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('popular')
  const [page, setPage] = useState(1)

  // Use TanStack Query — seeds with server data (ISR), deduplicates, caches for 10 min.
  // No separate manual fetch needed: if server gave us data, it's used instantly.
  // If for any reason server data is empty, TanStack will fetch from /api/areas.
  const { data: areasData = [], isLoading: loading } = useAreas({
    initialData: initialAreas.length > 0 ? initialAreas : undefined,
    initialDataUpdatedAt: initialAreas.length > 0 ? Date.now() : undefined,
  })

  const areas = Array.isArray(areasData) ? areasData : []

  // Debounce: wait 200ms after the user stops typing before re-filtering
  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== localQ) {
        setQ(localQ)
        setPage(1)
      }
    }, 200)
    return () => clearTimeout(t)
  }, [localQ, q])

  const enriched = useMemo(
    () => areas.map((a) => ({ ...a, priceVal: parsePrice(a.startingPrice) })),
    [areas],
  )

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = term
      ? enriched.filter(
          (a) => a.name.toLowerCase().includes(term) || a.city.toLowerCase().includes(term),
        )
      : enriched

    const sorted = [...list]
    if (sort === 'price-low') sorted.sort((a, b) => a.priceVal - b.priceVal)
    if (sort === 'price-high') sorted.sort((a, b) => b.priceVal - a.priceVal)
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [enriched, q, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, totalPages)
  const pageItems = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary backdrop-blur">
            <TrendingUp className="h-3.5 w-3.5" /> Localities
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Discover Nagpur's most{' '}
            <span className="bg-gradient-primary bg-clip-text text-transparent">livable</span>{' '}
            neighbourhoods
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Curated localities ranked by infrastructure, growth and lifestyle — with real inventory
            you can shortlist today.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-background px-4 shadow-soft">
              <Search className="h-4 w-4 text-primary" />
              <input
                value={localQ}
                onChange={(e) => { setLocalQ(e.target.value) }}
                placeholder="Search areas — e.g. MIHAN, Manish Nagar…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {localQ && (
                <button onClick={() => { setLocalQ(''); setQ(''); setPage(1); }} className="text-muted-foreground hover:text-foreground" aria-label="Clear">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="h-12 rounded-2xl border border-border bg-background px-4 text-sm font-medium shadow-soft outline-none"
            >
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing{' '}
            <span className="font-semibold text-foreground">{pageItems.length}</span> of{' '}
            <span className="font-semibold text-foreground">{filtered.length}</span> areas
          </span>
          <span className="hidden sm:inline">Page {current} / {totalPages}</span>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : areas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <div className="font-display text-lg font-semibold">No areas yet</div>
            <p className="mt-1 text-sm text-muted-foreground">Areas are managed through the admin panel. Check back soon.</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <div className="font-display text-lg font-semibold">No areas match "{localQ}".</div>
            <p className="mt-1 text-sm text-muted-foreground">Try a different name or clear the search.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((a) => (
              <Link
                key={a.slug}
                href={`/areas/${a.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {a.banner && (
                    <Image
                      src={a.banner}
                      alt={a.name || 'Nagpur Locality'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-background">
                    <div className="text-[10px] uppercase tracking-widest opacity-80">{a.city}</div>
                    <div className="font-display text-2xl font-extrabold leading-tight">{a.name}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>From</span>
                    <span className="font-bold text-foreground">{a.startingPrice}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} className={current === 1 ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
              {getPaginationRange(current, totalPages).map((p, idx) => (
                <PaginationItem key={idx}>
                  {p === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink href="#" isActive={current === p} onClick={(e) => { e.preventDefault(); setPage(p); }}>{p}</PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }} className={current === totalPages ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </div>
  )
}
