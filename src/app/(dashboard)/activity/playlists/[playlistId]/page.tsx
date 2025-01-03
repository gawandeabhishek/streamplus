import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { getYoutubeClient } from "@/lib/youtube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListMusic } from "lucide-react";
import { VideoGrid } from "@/components/video/video-grid";
import { Suspense } from "react";
import { PlaylistVideosSkeleton } from "@/components/skeletons/playlist-videos-skeleton";

interface PlaylistPageProps {
  params: {
    playlistId: string;
  };
}

export async function generateMetadata({ params }: PlaylistPageProps): Promise<Metadata> {
  const youtube = await getYoutubeClient();
  const playlist = await youtube.playlists.list({
    part: ['snippet'],
    id: [params.playlistId]
  });

  const title = playlist.data.items?.[0]?.snippet?.title || 'Playlist';
  
  return {
    title: `${title} | TubePlus`,
    description: playlist.data.items?.[0]?.snippet?.description || 'YouTube playlist',
  };
}

async function getPlaylistVideos(playlistId: string) {
  const youtube = await getYoutubeClient();
  
  const response = await youtube.playlistItems.list({
    part: ['snippet', 'contentDetails'],
    playlistId: playlistId,
    maxResults: 50
  });

  return Promise.all(
    response.data.items?.map(async (item) => {
      const videoId = item.contentDetails?.videoId || '';
      const videoDetails = await youtube.videos.list({
        part: ['statistics'],
        id: [videoId]
      });

      return {
        id: videoId,
        title: item.snippet?.title || 'Untitled',
        thumbnail: {
          url: item.snippet?.thumbnails?.high?.url || '',
          width: item.snippet?.thumbnails?.high?.width || 1280,
          height: item.snippet?.thumbnails?.high?.height || 720
        },
        channelTitle: item.snippet?.channelTitle || '',
        publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
        viewCount: videoDetails.data.items?.[0]?.statistics?.viewCount || '0'
      };
    }) || []
  );
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Playlist"
        text="Videos in this playlist"
      />
      <Suspense fallback={<PlaylistVideosSkeleton />}>
        <PlaylistContent params={params} />
      </Suspense>
    </DashboardShell>
  );
}

async function PlaylistContent({ params }: PlaylistPageProps) {
  await getServerSession(authOptions);
  
  try {
    const videos = await getPlaylistVideos(params.playlistId);
    const youtube = await getYoutubeClient();
    const playlist = await youtube.playlists.list({
      part: ['snippet'],
      id: [params.playlistId]
    });
    
    const playlistTitle = playlist.data.items?.[0]?.snippet?.title || 'Playlist';

    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <ListMusic className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{playlistTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No videos in playlist</h3>
              <p className="text-muted-foreground mt-2">
                This playlist is empty
              </p>
            </div>
          ) : (
            <VideoGrid videos={videos} />
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <ListMusic className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Playlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Unable to fetch playlist videos. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
} 