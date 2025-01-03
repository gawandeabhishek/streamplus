"use client";

import { motion } from "framer-motion";
import { VideoCard } from "@/components/video/video-card";

export function History() {
  const historyVideos = [
    {
      id: "1",
      title: "Building a Real-time Chat App",
      thumbnail: "/placeholder.jpg",
      channelTitle: "Coding Journey",
      publishedAt: new Date().toISOString(),
      viewCount: "3.4K"
    },
    // Add more sample videos as needed
  ];

  return (
    <div className="mt-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {historyVideos.map((video, index) => (
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