import { Skeleton } from "@/components/ui/skeleton";
import { PageTemplate } from "@/components/page-template";
import { Card, CardContent } from "@/components/ui/card";

export function BrandsSkeleton() {
  return (
    <PageTemplate currentPage="Brands">
      <div className="space-y-8 animate-pulse">
        {/* Page Hero Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-2 border-primary/10 pl-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-[40ch]" />
          </div>
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-md p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="text-right space-y-2">
                  <Skeleton className="h-8 w-12 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-card border border-border rounded-md p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[150px] rounded-md" />
              <Skeleton className="h-10 w-[150px] rounded-md" />
            </div>
          </div>
        </div>

        {/* Brands Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-md h-[300px] p-5 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTemplate>
  );
}
