import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { VideoGrid } from "@/components/video/video-grid";
import { getYoutubeClient } from "@/lib/youtube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp } from "lucide-react";
import { Suspense } from "react";
import { LikedVideosSkeleton } from "@/components/skeletons/liked-videos-skeleton";
import { LikedVideosGrid } from "@/components/liked/liked-videos-grid";
import { LikedVideosActions } from "@/components/liked/liked-videos-actions";
import { useRouter } from "next/navigation";

export const metadata: Metadata = {
  title: "Liked Videos | TubePlus",
  description: "Videos you've liked on YouTube",
};

export default async function LikedPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Liked Videos"
        description="Videos you've liked on YouTube"
        action={<LikedVideosActions />}
      />
      <Suspense fallback={<LikedVideosSkeleton />}>
        <LikedVideosContent />
      </Suspense>
    </DashboardShell>
  );
}

async function LikedVideosContent() {
  const youtube = await getYoutubeClient();

  try {
    const likedVideos = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      myRating: 'like',
      maxResults: 50
    });

    const videos = likedVideos.data.items?.map((item) => ({
      id: item.id || '',
      title: item.snippet?.title || 'Untitled',
      thumbnail: {
        url: item.snippet?.thumbnails?.high?.url || '',
        width: item.snippet?.thumbnails?.high?.width || 1280,
        height: item.snippet?.thumbnails?.high?.height || 720
      },
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
      viewCount: item.statistics?.viewCount || '0'
    })) || [];

    return <LikedVideosGrid videos={videos} />;
  } catch (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Failed to load liked videos
          </p>
        </CardContent>
      </Card>
    );
  }
} 