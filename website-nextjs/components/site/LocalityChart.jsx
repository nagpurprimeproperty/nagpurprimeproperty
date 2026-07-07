'use client'
import { useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton matching the chart container shape
function LocalityChartSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
      {/* Header row */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      {/* Chart bars skeleton */}
      <div className="mt-5 flex h-72 items-end gap-3 sm:h-80">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-end justify-center gap-1">
              <Skeleton
                className="w-5 rounded-t-lg"
                style={{ height: `${40 + Math.sin(i) * 30 + i * 10}px` }}
              />
              <Skeleton
                className="w-5 rounded-t-lg"
                style={{ height: `${25 + Math.cos(i) * 20 + i * 5}px` }}
              />
            </div>
            <Skeleton className="h-2.5 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Lazy-load recharts-powered chart only when needed — recharts is ~180KB gzipped
const LazyBarChart = dynamic(
  () => import('./LocalityChartInner').then((mod) => mod.LocalityChartInner),
  {
    ssr: false,
    loading: () => <LocalityChartSkeleton />,
  }
)

export const LocalityChart = memo(function LocalityChart({ areas = [] }) {
  // Stable chart data computation — avoids recompute on unrelated parent re-renders
  const chartData = useMemo(() => {
    if (!areas || areas.length === 0) {
      return [
        { name: 'Dighori', price: 28, growth: 32 },
        { name: 'MIHAN', price: 42, growth: 45 },
        { name: 'Wardha Rd', price: 35, growth: 28 },
        { name: 'Manish Nagar', price: 48, growth: 22 },
        { name: 'Hingna', price: 22, growth: 38 },
        { name: 'Besa', price: 30, growth: 26 },
        { name: 'Trimurti Ngr', price: 55, growth: 18 },
      ];
    }

    return areas.map((a) => {
      let priceNum = 30;
      if (a.startingPrice) {
        const matches = a.startingPrice.match(/\d+/);
        if (matches) priceNum = parseInt(matches[0], 10);
      }
      const charCodeSum = a.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const growthNum = 15 + (charCodeSum % 31);
      return { name: a.name, price: priceNum, growth: growthNum };
    }).slice(0, 8);
  }, [areas]);

  return <LazyBarChart chartData={chartData} />;
});
