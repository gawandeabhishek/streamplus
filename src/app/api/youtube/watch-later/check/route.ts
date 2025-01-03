import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getYoutubeClient } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return new NextResponse("Video ID is required", { status: 400 });
    }

    const youtube = await getYoutubeClient();
    const playlists = await youtube.playlists.list({
      part: ['snippet'],
      mine: true
    });

    const watchLaterPlaylist = playlists.data.items?.find(
      playlist => playlist.snippet?.title === 'Watch Later (TubePlus)'
    );

    if (!watchLaterPlaylist?.id) {
      return NextResponse.json({ isInWatchLater: false });
    }

    const videos = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId: watchLaterPlaylist.id,
      maxResults: 50
    });

    const isInWatchLater = videos.data.items?.some(
      item => item.snippet?.resourceId?.videoId === videoId
    ) || false;

    return NextResponse.json({ isInWatchLater });
  } catch (error) {
    return new NextResponse("Failed to check watch later status", { status: 500 });
  }
} 