// app/blogs/BlogsClient.jsx — Client Component (search/tag/pagination logic)
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, Clock, Search, X } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
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
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useBlogs } from '@/lib/hooks/useBlogs'

const PER_PAGE = 6

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogsClient({ blogs: initialBlogs = [] }) {
  // localQ: what the input shows (updates every keystroke)
  // q: debounced value that drives the useMemo filter (updates 200ms after typing stops)
  const [localQ, setLocalQ] = useState('')
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('All')
  const [page, setPage] = useState(1)

  // Use TanStack Query — seeds with server data, caches, deduplicates.
  // If server gave initialBlogs, it's shown instantly with no extra fetch.
  const { data: blogsData = [], isLoading: loading } = useBlogs({
    initialData: initialBlogs.length > 0 ? initialBlogs : undefined,
    initialDataUpdatedAt: initialBlogs.length > 0 ? Date.now() : undefined,
  })
  const blogs = Array.isArray(blogsData) ? blogsData : []

  // Debounce: wait 200ms after the user stops typing before updating the filter
  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== localQ) {
        setQ(localQ)
        setPage(1)
      }
    }, 200)
    return () => clearTimeout(t)
  }, [localQ, q])

  const allTags = useMemo(() => {
    const s = new Set()
    blogs.forEach((b) => b.tags?.forEach((t) => s.add(t)))
    return ['All', ...Array.from(s)]
  }, [blogs])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return blogs.filter((b) => {
      const matchTag = tag === 'All' || b.tags?.includes(tag)
      const matchTerm =
        !term ||
        b.title.toLowerCase().includes(term) ||
        (b.excerpt || '').toLowerCase().includes(term) ||
        (b.author || '').toLowerCase().includes(term) ||
        (b.tags || []).some((t) => t.toLowerCase().includes(term)) ||
        (b.content || []).some(
          (block) =>
            (block.heading || '').toLowerCase().includes(term) ||
            (block.body || '').toLowerCase().includes(term)
        )
      return matchTag && matchTerm
    })
  }, [blogs, q, tag])

  // If searching or filtering by tag, do NOT separate the featured post. Show all in the grid.
  const showFeatured = !q && tag === 'All'
  const featured = showFeatured ? filtered[0] : null
  const gridItems = showFeatured ? filtered.slice(1) : filtered

  const totalPages = Math.max(1, Math.ceil(gridItems.length / PER_PAGE))
  const current = Math.min(page, totalPages)
  const pageItems = gridItems.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary backdrop-blur">
            <BookOpen className="h-3.5 w-3.5" /> The Journal
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Nagpur property{' '}
            <span className="bg-gradient-primary bg-clip-text text-transparent">insights</span>{' '}
            worth reading
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Buyer guides, investment trends and locality deep-dives written by our Nagpur experts.
          </p>
          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border bg-background px-4 shadow-soft sm:max-w-xl">
            <Search className="h-4 w-4 text-primary" />
            <input
              value={localQ}
              onChange={(e) => { setLocalQ(e.target.value) }}
              placeholder="Search articles, authors, topics…"
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {localQ && (
              <button onClick={() => { setLocalQ(''); setQ(''); setPage(1); }} className="text-muted-foreground hover:text-foreground" aria-label="Clear">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => { setTag(t); setPage(1); }}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  tag === t
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary hover:text-primary',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-2xl" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <div className="font-display text-lg font-semibold">No blogs yet</div>
            <p className="mt-1 text-sm text-muted-foreground">Blogs are managed through the admin panel. Check back soon.</p>
          </div>
        ) : (
          <>
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <div className="font-display text-lg font-semibold">No articles found.</div>
                <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or tag.</p>
              </div>
            )}

        {/* Featured */}
        {featured && current === 1 && !q && tag === 'All' && (
          <Link
            href={`/blogs/${featured.slug}`}
            className="group mb-10 grid overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
              {featured.cover && (
                <Image
                  src={featured.cover}
                  alt={featured.title || 'Featured Blog'}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <span className="absolute left-4 top-4 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur">Featured</span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <div className="flex flex-wrap gap-1.5">
                {featured.tags?.map((t) => (
                  <span key={t} className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">{t}</span>
                ))}
              </div>
              <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight group-hover:text-primary sm:text-4xl">{featured.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground sm:text-base">{featured.excerpt}</p>
              <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                {featured.authorImage && (
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-background">
                    <Image
                      src={featured.authorImage}
                      alt={featured.author || 'Author'}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="font-semibold text-foreground">{featured.author}</span>
                <span>•</span>
                <span>{formatDate(featured.date)}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readMins} min</span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((b) => (
            <Link
              key={b.slug}
              href={`/blogs/${b.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {b.cover && (
                  <Image
                    src={b.cover}
                    alt={b.title || 'Blog cover'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur">{b.tags?.[0]}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="line-clamp-2 font-display text-lg font-bold leading-snug group-hover:text-primary">{b.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{b.excerpt}</p>
                <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-muted-foreground">
                  {b.authorImage && (
                    <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={b.authorImage}
                        alt={b.author || 'Author'}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="font-medium text-foreground">{b.author}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {b.readMins} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
          </>
        )}
      </section>
    </div>
  )
}
