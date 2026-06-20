import { Skeleton } from "@/components/ui/skeleton";
import { PageTemplate } from "@/components/page-template";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PayoutSkeleton() {
  return (
    <PageTemplate currentPage="Payout">
      <div className="flex flex-col gap-8 animate-pulse">
        {/* Page Title & Description Skeleton */}
        <div className="flex flex-col gap-2 border-l-2 border-primary/10 pl-6">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-[50ch]" />
        </div>

        <Tabs defaultValue="payouts" className="w-full">
          <TabsList className="inline-flex items-center gap-1 bg-muted/30 p-1 rounded-md border border-border h-12 w-fit mb-8">
            <Skeleton className="h-10 w-40 rounded-sm" />
            <Skeleton className="h-10 w-40 rounded-sm" />
          </TabsList>
          
          <div className="bg-card rounded-md border border-border p-4 md:p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            
            {/* Table Header Placeholder */}
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
