"use client";

import { Button } from "@/components/ui/button";
import { Clock, ThumbsUp, Check, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface WatchActionsProps {
  videoId: string;
  isPremium?: boolean;
}

export function WatchActions({ videoId, isPremium = false }: WatchActionsProps) {
  const [isInWatchLater, setIsInWatchLater] = useState(false);

  useEffect(() => {
    checkWatchLaterStatus();
  }, [videoId]);

  const checkWatchLaterStatus = async () => {
    try {
      const response = await fetch(`/api/youtube/watch-later/check?videoId=${videoId}`);
      const { isInWatchLater } = await response.json();
      setIsInWatchLater(isInWatchLater);
    } catch (error) {
      console.error("Failed to check watch later status");
    }
  };

  const handleWatchLater = async () => {
    try {
      const response = await fetch("/api/youtube/watch-later", {
        method: isInWatchLater ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) throw new Error();
      
      setIsInWatchLater(!isInWatchLater);
      toast.success(isInWatchLater ? "Removed from Watch Later" : "Added to Watch Later");
    } catch (error) {
      toast.error("Failed to update Watch Later");
    }
  };

  const handleWatchTogether = () => {
    if (!isPremium) {
      toast.error("Watch Together is a premium feature");
      return;
    }
    toast.info("Watch together coming soon!");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isInWatchLater ? "default" : "outline"}
        size="sm"
        onClick={handleWatchLater}
        className={`flex items-center gap-2 ${isInWatchLater ? 'bg-green-600 hover:bg-green-700' : ''}`}
      >
        {isInWatchLater ? (
          <Check className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4 text-yellow-400" />
        )}
        {isInWatchLater ? 'Added' : 'Watch Later'}
      </Button>
      {isPremium && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleWatchTogether}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Watch Together
        </Button>
      )}
    </div>
  );
} 