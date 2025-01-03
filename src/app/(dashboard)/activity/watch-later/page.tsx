import { Metadata } from "next";
import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { getYoutubeClient } from "@/lib/youtube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { WatchLaterActions } from "@/components/watch-later/watch-later-actions";
import { WatchLaterVideoGrid } from "@/components/watch-later/watch-later-video-grid";
import { WatchLaterSkeleton } from "@/components/skeletons/watch-later-skeleton";

export const metadata: Metadata = {
  title: "Watch Later | TubePlus",
  description: "Videos you've saved to watch later",
};

async function WatchLaterContent() {
  const youtube = await getYoutubeClient();
  
  try {
    const playlists = await youtube.playlists.list({
      part: ['snippet'],
      mine: true
    });

    const watchLaterPlaylist = playlists.data.items?.find(
      playlist => playlist.snippet?.title === 'Watch Later (TubePlus)'
    );

    if (!watchLaterPlaylist?.id) {
      return (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Watch Later</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No videos saved yet</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const videos = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: watchLaterPlaylist.id,
      maxResults: 50
    });

    return <WatchLaterVideoGrid videos={videos.data.items || []} />;
  } catch (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Failed to load watch later videos
          </p>
        </CardContent>
      </Card>
    );
  }
}

export default function WatchLaterPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Watch Later"
        text="Videos you've saved to watch later"
      >
        <WatchLaterActions />
      </DashboardHeader>
      <Suspense fallback={<WatchLaterSkeleton />}>
        <WatchLaterContent />
      </Suspense>
    </DashboardShell>
  );
} 