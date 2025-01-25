"use client";

import { VideoSync } from "./video-sync";
import { useRef } from "react";
import { useSupabase } from "@/providers/supabase-provider";

export function VideoPlayer({ videoId }: { videoId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { supabase } = useSupabase();

  const handleTimeUpdate = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handlePlayPause = (isPlaying: boolean) => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const broadcastUpdate = async (currentTime: number, isPlaying: boolean) => {
    await supabase.channel(`watch:${videoId}`).send({
      type: 'broadcast',
      event: 'sync',
      payload: { currentTime, isPlaying }
    });
  };

  return (
    <div>
      <video
        ref={videoRef}
        onTimeUpdate={() => {
          if (videoRef.current) {
            broadcastUpdate(videoRef.current.currentTime, !videoRef.current.paused);
          }
        }}
      />
      <VideoSync
        videoId={videoId}
        onTimeUpdate={handleTimeUpdate}
        onPlayPause={handlePlayPause}
      />
    </div>
  );
} 