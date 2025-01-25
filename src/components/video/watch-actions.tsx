"use client";

import { Button } from "@/components/ui/button";
import { WatchWithDialog } from "@/components/stream/watch-with-dialog";
import { useState } from "react";
import { Users } from "lucide-react";

interface WatchActionsProps {
  videoId: string;
}

export function WatchActions({ videoId }: WatchActionsProps) {
  const [showWatchWith, setShowWatchWith] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowWatchWith(true)}
      >
        <Users className="h-4 w-4 mr-2" />
        Watch Together
      </Button>

      <WatchWithDialog
        open={showWatchWith}
        onOpenChange={setShowWatchWith}
        videoId={videoId}
      />
    </>
  );
} 