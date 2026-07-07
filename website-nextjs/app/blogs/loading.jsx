import { Skeleton } from '@/components/ui/skeleton'

export default function BlogsLoading() {
  return (
    <div className="bg-background mx-auto max-w-7xl px-4 py-14 sm:px-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 bg-muted-foreground/15 rounded-full" />
        <Skeleton className="h-12 w-2/3 bg-muted-foreground/15" />
        <Skeleton className="h-5 w-1/2 bg-muted-foreground/10" />
      </div>

      {/* Search Input Skeleton */}
      <div className="mt-8">
        <Skeleton className="h-12 max-w-xl bg-muted-foreground/15 rounded-2xl" />
      </div>

      {/* Tags Filter Skeleton */}
      <div className="mt-5 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 bg-muted-foreground/10 rounded-full" />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-2xl bg-muted-foreground/15" />
            <Skeleton className="h-6 w-2/3 bg-muted-foreground/15" />
            <Skeleton className="h-4 w-1/3 bg-muted-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  )
}
