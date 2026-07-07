'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useAuth, useClientAuth } from '@/lib/stores'
import { useSavedProperties } from '@/lib/hooks/useProfile'
import { PropertyCard, PropertyCardSkeleton } from '@/components/site/PropertyCard'
import { Button } from '@/components/ui/button'
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

export default function FavoritesPage() {
  const [page, setPage] = useState(1)
  // useClientAuth: null before mount (SSR safe), real value after mount
  const { token } = useClientAuth()
  const openAuth = useAuth((s) => s.openAuth)
  const { data, isLoading } = useSavedProperties(token, page)

  const favs = Array.isArray(data) ? data : data?.data ?? []
  const total = data?.total ?? favs.length
  const totalPages = data?.totalPages ?? 1

  if (!token) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mt-10 rounded-2xl border border-dashed border-border p-14 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-primary">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">Login to see your favorites</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Save properties and access them from any device.
          </p>
          <Button variant="hero" className="mt-5" onClick={openAuth}>Login / Sign up</Button>
        </div>
      </div>
    )
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="text-xs font-semibold uppercase tracking-widest text-primary">Saved</div>
      <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Your favorites</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isLoading ? 'Loading…' : `${total} saved ${total === 1 ? 'property' : 'properties'}`}
      </p>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : favs.length ? (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favs.map((p, i) => <PropertyCard key={p._id || p.id} p={p} index={i} />)}
          </div>
          
          {totalPages > 1 && (
            <Pagination className="mt-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) handlePageChange(page - 1)
                    }}
                    className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {getPaginationRange(page, totalPages).map((p, idx) => (
                  <PaginationItem key={idx}>
                    {p === '...' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={page === p}
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(p)
                        }}
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) handlePageChange(page + 1)
                    }}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-14 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-primary">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">No favorites yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any property to save it for later.</p>
          <Link href="/properties" className="mt-5 inline-block">
            <Button variant="hero">Browse Properties</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
