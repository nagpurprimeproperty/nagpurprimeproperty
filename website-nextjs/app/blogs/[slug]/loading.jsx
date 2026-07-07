// app/blogs/[slug]/loading.jsx — Blog Detail Loading Skeleton
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogDetailLoading() {
  return (
    <div className="bg-gradient-to-b from-accent/30 to-background min-h-screen pb-16">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        
        {/* Back Link */}
        <Skeleton className="h-4 w-28 mb-8" />

        {/* Blog Header */}
        <div className="space-y-4 mb-8">
          <Skeleton className="h-10 w-5/6" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <Skeleton className="aspect-video w-full rounded-3xl mb-10 h-[380px]" />

        {/* Blog content block */}
        <div className="space-y-6">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          
          <Skeleton className="h-7 w-48 mt-8 mb-4" />
          
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>

      </div>
    </div>
  );
}
