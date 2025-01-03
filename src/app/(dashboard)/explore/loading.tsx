import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Explore"
        text="Search and discover videos to watch together"
      />
      <div className="grid gap-6">
        <div className="max-w-2xl">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
} 