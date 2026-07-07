// app/areas/[areas]/loading.jsx — Area Detail Loading Skeleton
import { Skeleton } from "@/components/ui/skeleton";

export default function AreaDetailLoading() {
  return (
    <div className="bg-gradient-to-b from-accent/30 to-background min-h-screen pb-16">
      {/* Banner Skeleton */}
      <div className="relative h-[250px] w-full bg-muted/20 overflow-hidden sm:h-[350px]">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Title and stats row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Content layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Guide tabs skeleton */}
            <div className="flex border-b border-border gap-6 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>

            {/* Guide content area */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* List entries skeleton */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
