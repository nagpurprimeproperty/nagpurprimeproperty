// app/properties/[slug]/loading.jsx — Property Detail Loading Skeleton
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyDetailLoading() {
  return (
    <div className="bg-gradient-to-b from-accent/30 to-background min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-24" />
          <span className="text-muted-foreground/30">/</span>
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Title and price row skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-9 w-2/3 max-w-lg mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="text-left md:text-right">
            <Skeleton className="h-9 w-36 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Gallery grid skeleton */}
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          <div className="md:col-span-2">
            <Skeleton className="aspect-video w-full rounded-2xl md:h-[450px]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <Skeleton className="aspect-video md:aspect-auto md:h-[217px] w-full rounded-2xl" />
            <Skeleton className="aspect-video md:aspect-auto md:h-[217px] w-full rounded-2xl" />
          </div>
        </div>

        {/* Content columns skeleton */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left content column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick overview pills */}
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border bg-card p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center justify-center py-2">
                  <Skeleton className="h-5 w-8 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-36 mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-36 mb-2" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>

          </div>

          {/* Right sticky sidebar column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
