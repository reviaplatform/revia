import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageTemplate } from "@/components/page-template";

export function DashboardSkeleton() {
  return (
    <PageTemplate currentPage="Dashboard">
      <div className="flex flex-col gap-6 md:gap-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-2 border-primary/10 pl-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/50 bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent className="pb-5 px-5 space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/50 bg-card h-[450px]">
            <CardHeader className="px-6 pt-6 pb-2">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-full w-full rounded-lg" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card h-[450px]">
            <CardHeader className="px-6 pt-6 pb-2">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Tables Skeleton Row */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
          <Card className="col-span-1 lg:col-span-4 border-border/50 bg-card h-[400px]">
             <CardHeader className="px-6 pt-6 pb-4 border-b border-border/50">
               <Skeleton className="h-5 w-40" />
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/10">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
             </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-3 border-border/50 bg-card h-[400px]">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-border/50">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
              <Skeleton className="h-10 w-full rounded-md mt-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
