"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/lib/utils";

interface VideoCardProps {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
}

const formatDuration = (duration: string) => {
  // Handle PT8M52S format
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return duration;

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.padStart(2, '0')}`;
};

export function VideoCard({
  videoId,
  title,
  thumbnail,
  duration,
  views
}: VideoCardProps) {
  const router = useRouter();

  if (!views) return null;

  const handleWatchTogether = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/watch/${videoId}?together=true`);
  };

  return (
    <div className={cn(
      "flex gap-3 w-[320px] rounded-lg overflow-hidden p-2",
      "bg-card border border-border hover:bg-accent/90 transition-all duration-300",
      "hover:shadow-md hover:border-accent/20"
    )}>
      {/* Thumbnail Section */}
      <div 
        className="relative w-[140px] h-[80px] flex-shrink-0 rounded-md overflow-hidden"
        style={{
          backgroundImage: `url(${thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0 flex flex-col">
        <h4 className="font-medium text-sm line-clamp-2 mb-1 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h4>
        <div className="text-xs text-muted-foreground mb-auto">
          {formatCompactNumber(views)} views
        </div>
        <button
          onClick={handleWatchTogether}
          className="text-xs text-primary hover:text-blue-500 font-medium mt-2 text-left transition-colors"
        >
          Watch Together
        </button>
      </div>
    </div>
  );
}

// Helper function to extract video ID from YouTube URL
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /\/watch\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}