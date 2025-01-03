"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { VideoCard } from "@/components/video/video-card";
import { Skeleton } from "@/components/ui/skeleton";

interface Video {
  id: string;
  title: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
}

export function LikedVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLikedVideos() {
      try {
        const response = await fetch("/api/youtube/liked");
        if (!response.ok) throw new Error("Failed to fetch liked videos");
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error("Error fetching liked videos:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLikedVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <VideoCard video={video} />
        </motion.div>
      ))}
    </div>
  );
} 