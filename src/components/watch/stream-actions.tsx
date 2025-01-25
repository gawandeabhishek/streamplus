"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WatchWithDialog } from "@/components/stream/watch-with-dialog";

export function StreamActions({ videoId }: { videoId: string }) {
  const [showWatchWith, setShowWatchWith] = useState(false);

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
} 