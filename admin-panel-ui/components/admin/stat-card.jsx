import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { memo } from "react";
export const StatCard = memo(
  function StatCard({ title, value, icon: Icon, trend, subtitle, className, isLoading }) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-foreground break-words">{value}</p>
              )}
              {trend && !isLoading && (
                <div className={cn("flex items-center gap-1 text-xs sm:text-sm font-medium flex-wrap", trend.isPositive ? "text-green-600" : "text-red-600")}>
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                  )}
                  <span>{trend.value}%</span>
                  <span className="text-muted-foreground hidden sm:inline">vs last month</span>
                </div>
              )}
              {subtitle && !isLoading && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{subtitle}</p>
              )}
            </div>
            <div className="rounded-lg bg-primary/10 p-2 sm:p-3 shrink-0">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.value === nextProps.value &&
      prevProps.trend?.value === nextProps.trend?.value &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);
