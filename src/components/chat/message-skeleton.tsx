"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageSkeletonProps {
  isCurrentUser?: boolean;
}

export function MessageSkeleton({ isCurrentUser }: MessageSkeletonProps) {
  return (
    <div className={cn(
      "flex items-start gap-4 p-4",
      isCurrentUser && "flex-row-reverse"
    )}>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className={cn(
        "flex flex-col gap-2",
        isCurrentUser && "items-end"
      )}>
        {!isCurrentUser && (
          <Skeleton className="h-4 w-[120px] rounded-lg" />
        )}
        <div className={cn(
          "space-y-2",
          isCurrentUser && "flex flex-col items-end"
        )}>
          <Skeleton className="h-16 w-[250px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}