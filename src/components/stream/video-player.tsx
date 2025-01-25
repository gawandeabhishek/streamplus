"use client";

import { useEffect, useRef } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useSession } from "next-auth/react";

interface VideoPlayerProps {
  videoId: string;
  streamId: string;
}

export function VideoPlayer({ videoId, streamId }: VideoPlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const { supabase } = useSupabase();
  const { data: session } = useSession();
  const isSeekingRef = useRef(false);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    loadYouTubeAPI();

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new YT.Player('youtube-player', {
        videoId,
        events: {
          onStateChange: handlePlayerStateChange,
          onReady: () => console.log("Player ready")
        }
      });
    };

    const channel = supabase.channel(`stream:${streamId}`)
      .on('broadcast', { event: 'video-sync' }, ({ payload }) => {
        if (payload.userId !== session?.user?.id) {
          handleRemoteControl(payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, streamId]);

  const handlePlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (!isSeekingRef.current && playerRef.current) {
      broadcastVideoState({
        state: event.data,
        time: playerRef.current.getCurrentTime()
      });
    }
  };

  const handleRemoteControl = async (payload: any) => {
    if (!playerRef.current) return;
    
    isSeekingRef.current = true;
    
    switch (payload.action) {
      case 'play':
        await playerRef.current.seekTo(payload.time, true);
        playerRef.current.playVideo();
        break;
      case 'pause':
        await playerRef.current.seekTo(payload.time, true);
        playerRef.current.pauseVideo();
        break;
      case 'seek':
        await playerRef.current.seekTo(payload.time, true);
        break;
    }
    
    setTimeout(() => {
      isSeekingRef.current = false;
    }, 1000);
  };

  const broadcastVideoState = async (data: any) => {
    await supabase.channel(`stream:${streamId}`).send({
      type: 'broadcast',
      event: 'video-sync',
      payload: {
        ...data,
        userId: session?.user?.id
      }
    });
  };

  return (
    <div className="aspect-video w-full bg-black">
      <div id="youtube-player" />
    </div>
  );
} 