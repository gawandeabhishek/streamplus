"use client";

import { useRouter } from "next/navigation";
import { VideoGrid } from "@/components/video/video-grid";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { formatCompactNumber } from "@/lib/format";

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

export function LikedVideosGrid({ videos }: { videos: Video[] }) {
  const router = useRouter();

  const handleUnlike = async (videoId: string) => {
    try {
      const response = await fetch("/api/youtube/liked", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) throw new Error();
      toast.success("Video unliked");
      router.refresh();
    } catch (error) {
      toast.error("Failed to unlike video");
    }
  };

  const formattedVideos = videos.map(video => ({
    ...video,
    formattedDate: formatDistanceToNow(parseISO(video.publishedAt), { addSuffix: true }),
    formattedViews: `${formatCompactNumber(parseInt(video.viewCount))} views`
  }));

  return <VideoGrid videos={formattedVideos} onUnlike={handleUnlike} />;
}