"use client";

import { VideoSync } from "./video-sync";
import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import { useSession } from "next-auth/react";
import { DisconnectButton } from "./disconnect-button";
import { toast } from "sonner";

const SYNC_THRESHOLD = 0.5;

export function VideoContainer({ videoId }: { videoId: string }) {
  const playerRef = useRef<any>(null);
  const { supabase } = useSupabase();
  const { data: session } = useSession();
  const lastUpdateRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const channel = supabase.channel(`watch_room_${videoId}`);
    channelRef.current = channel;
    let visibilityHandler: any;

    const handleStateChange = async (event: { data: number }) => {
      if (!playerRef.current || !isInitialized) return;
      
      // Don't trigger state changes when tab is hidden
      if (document.hidden) return;
      
      const currentTime = playerRef.current.getCurrentTime();
      const currentState = event.data;
      
      const now = Date.now();
      if (now - lastUpdateRef.current < 500) return;
      lastUpdateRef.current = now;

      console.log("Sending state change:", { currentState, currentTime });
      
      if (currentState === 1 || currentState === 2) {
        try {
          await channelRef.current.send({
            type: 'broadcast',
            event: 'video_state_change',
            payload: {
              state: currentState,
              time: currentTime,
              videoId,
              timestamp: now,
              senderId: session?.user?.id
            }
          });
        } catch (error) {
          console.error("Error sending state:", error);
        }
      }
    };

    // Handle visibility changes
    visibilityHandler = () => {
      if (!document.hidden && playerRef.current) {
        // Request current state when returning to tab
        channel.send({
          type: 'broadcast',
          event: 'request_video_state',
          payload: {
            videoId,
            requesterId: session?.user?.id,
            timestamp: Date.now()
          }
        });
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    const initYouTubePlayer = () => {
      console.log("Initializing YouTube player");
      const player = new window.YT.Player('youtube-player', {
        videoId,
        height: '100%',
        width: '100%',
        events: {
          onReady: (event: { target: any }) => {
            console.log("Player ready");
            playerRef.current = event.target;
            playerRef.current.pauseVideo();
            setIsInitialized(true);
          },
          onStateChange: handleStateChange
        },
        playerVars: {
          controls: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initYouTubePlayer;
    } else {
      initYouTubePlayer();
    }

    channel
      .on('broadcast', { event: 'video_state_change' }, ({ payload }) => {
        console.log("Received state change:", payload);
        if (payload.senderId === session?.user?.id || !playerRef.current || !isInitialized) return;

        const currentTime = playerRef.current.getCurrentTime();
        if (Math.abs(currentTime - payload.time) > 0.5) {
          playerRef.current.seekTo(payload.time, true);
        }

        setTimeout(() => {
          if (payload.state === 2) {
            playerRef.current.pauseVideo();
          } else if (payload.state === 1) {
            playerRef.current.playVideo();
          }
        }, 100);
      })
      .subscribe((status) => {
        console.log("Channel status:", status);
      });

    return () => {
      channel.unsubscribe();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [videoId, supabase, session, isInitialized]);

  return (
    <div className="relative w-full h-full bg-black">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        <DisconnectButton videoId={videoId} />
      </div>
      <div id="youtube-player" className="absolute inset-0" />
      <VideoSync 
        videoId={videoId}
        onTimeUpdate={(time) => {
          if (playerRef.current) {
            playerRef.current.seekTo(time, true);
          }
        }}
        onPlayPause={(isPlaying) => {
          if (playerRef.current) {
            if (isPlaying) {
              playerRef.current.playVideo();
            } else {
              playerRef.current.pauseVideo();
            }
          }
        }}
      />
    </div>
  );
} 