'use client'
import { useEffect, useState, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

// Skeleton matching the blog card shape (16/10 image + text rows)
function LatestBlogsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {/* Cover image placeholder */}
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-2 p-4">
            {/* Tags */}
            <div className="flex gap-1.5">
              <Skeleton className="h-4 w-14 rounded-full" />
              <Skeleton className="h-4 w-10 rounded-full" />
            </div>
            {/* Title */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            {/* Date + read time */}
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

const LatestBlogsSection = memo(function LatestBlogsSection({ initial = [] }) {
  const [blogs, setBlogs] = useState(initial)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setBlogs(initial)
  }, [initial])

  useEffect(() => {
    if (blogs.length === 0) {
      setLoading(true)
      async function load() {
        try {
          const res = await fetch('/api/blogs?limit=3')
          const json = await res.json()
          if (json.success && Array.isArray(json.data)) {
            setBlogs(json.data)
          }
        } catch (err) {
          console.error('Failed to load latest blogs on client:', err)
        } finally {
          setLoading(false)
        }
      }
      load()
    }
  }, [blogs])

  const latestBlogs = blogs.slice(0, 3)

  if (loading) return <LatestBlogsSkeleton />

  if (latestBlogs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Blogs are being set up. <Link href="/blogs" className="text-primary hover:underline">Browse blog →</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {latestBlogs.map((b) => (
        <Link key={b.slug} href={`/blogs/${b.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {b.cover && (
              <Image
                src={b.cover}
                alt={b.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-1.5">
              {b.tags?.slice(0, 2).map((t) => (
                <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">{t}</span>
              ))}
            </div>
            <h3 className="mt-2 line-clamp-2 font-display text-base font-bold group-hover:text-primary">{b.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} • {b.readMins} min read
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
})

export default LatestBlogsSection
