import { Skeleton } from "@/components/ui/skeleton";
import { PageTemplate } from "@/components/page-template";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export function ProfileSkeleton() {
  return (
    <PageTemplate currentPage="Profile">
      <div className="space-y-8 animate-pulse">
        {/* Page Hero Skeleton */}
        <div className="flex flex-col gap-1 border-l-2 border-primary/10 pl-6">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-[40ch]" />
        </div>

        {/* Tabs Skeleton */}
        <Tabs defaultValue="details" className="w-full mt-4">
          <TabsList className="flex items-center gap-1 bg-muted/30 p-1 rounded-md border border-border h-12 w-fit">
            <Skeleton className="h-10 w-40 rounded-sm" />
            <Skeleton className="h-10 w-40 rounded-sm" />
          </TabsList>

          <div className="mt-8 bg-card rounded-md border border-border p-4 md:p-8 py-8 md:py-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-md" />
                ))}
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <Skeleton className="h-11 w-32 rounded-md" />
            </div>
          </div>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
