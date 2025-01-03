"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface WatchLaterButtonProps {
  videoId: string;
  title: string;
  thumbnail: string;
}

export function WatchLaterButton({ videoId, title, thumbnail }: WatchLaterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addToWatchLater = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          title,
          thumbnail,
          type: "WATCH_LATER",
        }),
      });

      if (!response.ok) throw new Error("Failed to add to watch later");

      toast({
        title: "Added to Watch Later",
        description: "This video has been added to your Watch Later list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add video to Watch Later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={addToWatchLater}
      disabled={isLoading}
    >
      <Clock className="mr-2 h-4 w-4" />
      Watch Later
    </Button>
  );
} 