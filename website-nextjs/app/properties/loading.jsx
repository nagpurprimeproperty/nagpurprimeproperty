import { PropertyCardSkeleton } from '@/components/site/PropertyCard'
import { Skeleton } from '@/components/ui/skeleton'

export default function PropertiesLoading() {
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
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
