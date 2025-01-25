"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { StreamChat } from "@/components/stream/stream-chat";
import { VideoPlayer } from "@/components/stream/video-player";
import { useSupabase } from "@/components/providers/supabase-provider";

interface StreamPageProps {
  params: {
    videoId: string;
  };
}

export default function StreamPage({ params }: StreamPageProps) {
  const { data: session } = useSession();
  const [showChat, setShowChat] = useState(true);
  const { supabase } = useSupabase();
  const videoId = params.videoId;
  const streamId = `${videoId}-${session?.user?.id}`;

  return (
    <div className="flex h-screen">
      <div className={cn(
        "flex-1 flex flex-col",
        showChat ? "mr-[350px]" : "mr-0"
      )}>
        <div className="relative flex-1 bg-black">
          <VideoPlayer videoId={videoId} streamId={streamId} />
          
          <div className="absolute bottom-4 right-4">
            <Button
              variant="outline"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {showChat && session?.user?.id && (
        <div className="fixed right-0 top-0 bottom-0 w-[350px] border-l">
          <StreamChat streamId={streamId} />
        </div>
      )}
    </div>
  );
} 