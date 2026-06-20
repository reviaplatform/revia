import { Skeleton } from "@/components/ui/skeleton";
import { PageTemplate } from "@/components/page-template";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SubscriptionsSkeleton() {
  return (
    <PageTemplate currentPage="Subscriptions">
      <div className="flex flex-col gap-8 animate-pulse">
        {/* Page Hero Skeleton */}
        <div className="border-l-2 border-primary/10 pl-6 space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Tabs Skeleton */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto mb-8 max-w-md">
            <Skeleton className="h-12 rounded-md" />
            <Skeleton className="h-12 rounded-md" />
          </TabsList>

          <div className="space-y-6">
            {/* Search/Filter Skeleton Area */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-10 flex-1 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border border-border/50 bg-card overflow-x-auto">
               <div className="h-12 bg-muted/50 border-b border-border/50" />
               <div className="space-y-4 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-sm" />
                  ))}
               </div>
            </div>
          </div>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
