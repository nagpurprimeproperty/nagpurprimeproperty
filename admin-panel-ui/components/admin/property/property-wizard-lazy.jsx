"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

function LazyStepFallback() {
    return (<div className="space-y-4 py-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0"/>
        <div className="space-y-2">
          <Skeleton className="h-4 w-44"/>
          <Skeleton className="h-3 w-64"/>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24"/>
            <Skeleton className="h-10 w-full rounded-md"/>
          </div>))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-28"/>
        <Skeleton className="h-24 w-full rounded-md"/>
      </div>
    </div>);
}

export const LazyLocationSection = dynamic(() => import("./form-sections/location-section").then((mod) => mod.LocationSection), {
    loading: () => <LazyStepFallback/>,
    ssr: false,
});

export const LazyPhotoUploader = dynamic(() => import("./photo-uploader").then((mod) => mod.PhotoUploader), {
    loading: () => <LazyStepFallback/>,
    ssr: false,
});
