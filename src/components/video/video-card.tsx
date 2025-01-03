import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatCompactNumber } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface VideoCardProps {
  video: {
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
  };
  showActions?: boolean;
}

export function VideoCard({ video, showActions = true }: VideoCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(false);

  useEffect(() => {
    checkWatchLaterStatus();
  }, [video.id]);

  const checkWatchLaterStatus = async () => {
    try {
      const response = await fetch(`/api/youtube/watch-later/check?videoId=${video.id}`);
      const { isInWatchLater: status } = await response.json();
      setIsInWatchLater(status);
    } catch (error) {
      console.error("Failed to check watch later status");
    }
  };

  const toggleWatchLater = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/youtube/watch-later", {
        method: isInWatchLater ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId: video.id }),
      });

      if (!response.ok) throw new Error();

      setIsInWatchLater(!isInWatchLater);
      toast.success(isInWatchLater ? "Removed from Watch Later" : "Added to Watch Later");
    } catch (error) {
      toast.error("Failed to update Watch Later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="group relative overflow-hidden rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-accent/50 transition-colors h-[200px] flex flex-col"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/watch/${video.id}`} className="flex-shrink-0">
        <div className="relative w-full h-[120px] overflow-hidden rounded-t-lg bg-muted">
          <Image
            src={video.thumbnail.url}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-all duration-300 group-hover:scale-110"
            priority
          />
          {showActions && (
            <motion.div 
              className="absolute bottom-2 right-2"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <Button 
                variant={isInWatchLater ? "default" : "secondary"}
                size="sm" 
                className={`${
                  isInWatchLater 
                    ? "bg-green-500/90 hover:bg-green-600/90 text-white" 
                    : "bg-black/80 text-white hover:bg-black/70"
                } backdrop-blur-sm`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleWatchLater();
                }}
                disabled={isLoading}
              >
                {isInWatchLater ? (
                  <Check className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                ) : (
                  <Clock className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                )}
                {isInWatchLater ? "Added" : "Watch Later"}
              </Button>
            </motion.div>
          )}
        </div>
      </Link>
      <div className="p-2 bg-gradient-to-b from-background/50 to-background/80 backdrop-blur-sm flex-1 flex flex-col justify-between">
        <h3 className="line-clamp-2 text-xs font-medium leading-tight">
          {video.title}
        </h3>
        <div className="text-[11px] text-muted-foreground">
          <p className="line-clamp-1 hover:text-primary transition-colors">
            {video.channelTitle}
          </p>
          <div className="flex items-center">
            <span>{formatCompactNumber(parseInt(video.viewCount))} views</span>
            <span className="mx-1">•</span>
            <span>{formatDistanceToNow(new Date(video.publishedAt))} ago</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 