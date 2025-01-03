"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Playlists() {
  const playlists = [
    {
      id: "1",
      title: "Favorite Music Videos",
      videoCount: 24,
      thumbnail: "/placeholder.jpg",
    },
    {
      id: "2",
      title: "Gaming Highlights",
      videoCount: 15,
      thumbnail: "/placeholder.jpg",
    },
    {
      id: "3",
      title: "Cooking Tutorials",
      videoCount: 8,
      thumbnail: "/placeholder.jpg",
    },
  ];

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Playlists</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Playlist
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist, index) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <img
                src={playlist.thumbnail}
                alt={playlist.title}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary">View Playlist</Button>
              </div>
            </div>
            <h3 className="mt-2 font-semibold">{playlist.title}</h3>
            <p className="text-sm text-muted-foreground">{playlist.videoCount} videos</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 