import { Skeleton } from '@/components/ui/skeleton'

export default function AreasLoading() {
  return (
    <div className="bg-background mx-auto max-w-7xl px-4 py-14 sm:px-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 bg-muted-foreground/15 rounded-full" />
        <Skeleton className="h-12 w-2/3 bg-muted-foreground/15" />
        <Skeleton className="h-5 w-1/2 bg-muted-foreground/10" />
      </div>

      {/* Search Input & Sort Skeleton */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-12 flex-1 bg-muted-foreground/15 rounded-2xl" />
        <Skeleton className="h-12 w-36 bg-muted-foreground/15 rounded-2xl" />
      </div>

      {/* Grid Skeleton */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4 border border-border bg-card rounded-2xl overflow-hidden shadow-soft">
            <Skeleton className="aspect-[16/10] w-full bg-muted-foreground/15" />
            <div className="p-4 flex items-center justify-between">
              <Skeleton className="h-4 w-1/3 bg-muted-foreground/15" />
              <Skeleton className="h-4 w-16 bg-muted-foreground/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
