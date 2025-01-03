"use client";

import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface OnlineIndicatorProps {
  userId: string;
  className?: string;
}

export function OnlineIndicator({ userId, className }: OnlineIndicatorProps) {
  const isOnline = useOnlineStatus(userId);

  return (
    <div
      className={cn(
        "h-2.5 w-2.5 rounded-full",
        isOnline ? "bg-green-500" : "bg-gray-300",
        className
      )}
    />
  );
} 