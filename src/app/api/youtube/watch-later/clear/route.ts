import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getYoutubeClient } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const youtube = await getYoutubeClient();
    
    // Get Watch Later playlist
    const playlists = await youtube.playlists.list({
      part: ['snippet'],
      mine: true
    });

    const watchLaterPlaylist = playlists.data.items?.find(
      playlist => playlist.snippet?.title === 'Watch Later (TubePlus)'
    );

    if (!watchLaterPlaylist?.id) {
      return new NextResponse("Watch Later playlist not found", { status: 404 });
    }

    // Get all videos in the playlist
    const videos = await youtube.playlistItems.list({
      part: ['id'],
      playlistId: watchLaterPlaylist.id,
      maxResults: 50
    });

    // Delete each video from the playlist
    if (videos.data.items) {
      await Promise.all(
        videos.data.items.map(item =>
          youtube.playlistItems.delete({ id: item.id! })
        )
      );
    }

    return new NextResponse("Watch Later playlist cleared", { status: 200 });
  } catch (error) {
    console.error("Error clearing watch later playlist:", error);
    return new NextResponse("Failed to clear Watch Later playlist", { status: 500 });
  }
} 