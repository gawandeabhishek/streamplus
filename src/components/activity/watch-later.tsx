"use client";

import { motion } from "framer-motion";
import { VideoCard } from "@/components/video/video-card";

export function WatchLater() {
  const watchLaterVideos = [
    {
      id: "1",
      title: "Next.js 14 Tutorial",
      thumbnail: "/placeholder.jpg",
      channelTitle: "Web Dev Pro",
      publishedAt: new Date().toISOString(),
      viewCount: "5.6K"
    },
    // Add more sample videos as needed
  ];

  return (
    <div className="mt-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {watchLaterVideos.map((video, index) => (
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
    </div>
  );
} 