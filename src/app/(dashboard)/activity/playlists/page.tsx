import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { getYoutubeClient } from "@/lib/youtube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListMusic } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { PlaylistSkeleton } from "@/components/skeletons/playlist-skeleton";

export const metadata: Metadata = {
  title: "Playlists | TubePlus",
  description: "Your YouTube playlists",
};

async function getPlaylists() {
  const youtube = await getYoutubeClient();
  
  const response = await youtube.playlists.list({
    part: ['snippet', 'contentDetails'],
    mine: true,
    maxResults: 50
  });

  return response.data.items?.map(playlist => ({
    id: playlist.id || '',
    title: playlist.snippet?.title || 'Untitled',
    description: playlist.snippet?.description || '',
    thumbnail: {
      url: playlist.snippet?.thumbnails?.high?.url || '',
      width: playlist.snippet?.thumbnails?.high?.width || 1280,
      height: playlist.snippet?.thumbnails?.high?.height || 720
    },
    videoCount: playlist.contentDetails?.itemCount || 0,
    createdAt: playlist.snippet?.publishedAt || new Date().toISOString(),
  })) || [];
}

export default async function PlaylistsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Playlists"
        text="Your YouTube playlists"
      />
      <Suspense fallback={<PlaylistSkeleton />}>
        <PlaylistContent />
      </Suspense>
    </DashboardShell>
  );
}

async function PlaylistContent() {
  await getServerSession(authOptions);
  
  try {
    const playlists = await getPlaylists();

    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <ListMusic className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Your Playlists</CardTitle>
        </CardHeader>
        <CardContent>
          {playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No playlists yet</h3>
              <p className="text-muted-foreground mt-2">
                Your YouTube playlists will appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {playlists.map((playlist, index) => (
                <Link 
                  key={playlist.id} 
                  href={`/activity/playlists/${playlist.id}`}
                  className="group"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                    <Image
                      src={playlist.thumbnail.url}
                      alt={playlist.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium">View Playlist</p>
                    </div>
                  </div>
                  <h3 className="font-semibold truncate group-hover:text-primary">
                    {playlist.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {playlist.videoCount} {playlist.videoCount === 1 ? 'video' : 'videos'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <ListMusic className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Your Playlists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Unable to fetch playlists. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
} 