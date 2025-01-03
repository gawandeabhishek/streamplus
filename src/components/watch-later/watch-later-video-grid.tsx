"use client"

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WatchLaterVideoGridProps {
  videos: any[];
}

export function WatchLaterVideoGrid({ videos }: WatchLaterVideoGridProps) {
  const router = useRouter();

  const handleRemove = async (videoId: string) => {
    try {
      const response = await fetch("/api/youtube/watch-later", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) throw new Error();
      toast.success("Video removed from Watch Later");
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove video");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <div key={video.contentDetails.videoId} className="group relative">
          <Link href={`/watch/${video.contentDetails.videoId}`}>
            <div className="aspect-video relative rounded-lg overflow-hidden mb-3">
              <Image
                src={video.snippet.thumbnails.high.url}
                alt={video.snippet.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <h3 className="font-semibold truncate group-hover:text-primary">
              {video.snippet.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {video.snippet.channelTitle}
            </p>
          </Link>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRemove(video.contentDetails.videoId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
} 