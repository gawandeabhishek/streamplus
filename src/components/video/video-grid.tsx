"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, ThumbsUp, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  channelTitle: string;
  formattedDate: string;
  formattedViews: string;
}

interface VideoGridProps {
  videos: Video[];
  onUnlike?: (videoId: string) => void;
}

export function VideoGrid({ videos, onUnlike }: VideoGridProps) {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [watchLaterStates, setWatchLaterStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    videos.forEach(async (video) => {
      try {
        const response = await fetch(`/api/youtube/watch-later/check?videoId=${video.id}`);
        const { isInWatchLater } = await response.json();
        setWatchLaterStates(prev => ({ ...prev, [video.id]: isInWatchLater }));
      } catch (error) {
        console.error("Failed to check watch later status");
      }
    });
  }, [videos]);

  const toggleWatchLater = async (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setLoadingStates(prev => ({ ...prev, [videoId]: true }));
    
    try {
      const response = await fetch("/api/youtube/watch-later", {
        method: watchLaterStates[videoId] ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) throw new Error();
      setWatchLaterStates(prev => ({ ...prev, [videoId]: !prev[videoId] }));
    } catch (error) {
      console.error("Failed to update Watch Later");
    } finally {
      setLoadingStates(prev => ({ ...prev, [videoId]: false }));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <ThumbsUp className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Your Liked Videos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ThumbsUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No liked videos yet</h3>
              <p className="text-muted-foreground mt-2">
                Videos you like will appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <div key={video.id} className="group relative">
                  <Link href={`/watch/${video.id}`}>
                    <div className="aspect-video relative rounded-lg overflow-hidden mb-3">
                      <Image
                        src={video.thumbnail.url}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {onUnlike && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            onUnlike(video.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant={watchLaterStates[video.id] ? "default" : "secondary"}
                        size="sm"
                        className={`absolute bottom-2 right-2 transition-opacity ${
                          loadingStates[video.id] ? "opacity-50" : "opacity-0 group-hover:opacity-100"
                        } ${
                          watchLaterStates[video.id] 
                            ? "bg-green-500/90 hover:bg-green-600/90 text-white" 
                            : "bg-black/80 hover:bg-black/70 text-white"
                        }`}
                        onClick={(e) => toggleWatchLater(video.id, e)}
                      >
                        {loadingStates[video.id] ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="mr-2"
                            >
                              <Clock className="h-4 w-4" />
                            </motion.div>
                            Watch Later
                          </>
                        ) : watchLaterStates[video.id] ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Added
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            Watch Later
                          </>
                        )}
                      </Button>
                    </div>
                    <h3 className="font-semibold truncate group-hover:text-primary">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {video.channelTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {video.formattedViews} • {video.formattedDate}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 