import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getYoutubeClient } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { videoId } = await req.json();
    const youtube = await getYoutubeClient();

    // First, get the Watch Later playlist
    const playlists = await youtube.playlists.list({
      part: ['snippet'],
      mine: true
    });

    let watchLaterPlaylist = playlists.data.items?.find(
      playlist => playlist.snippet?.title === 'Watch Later (TubePlus)'
    );

    // Create playlist if it doesn't exist
    if (!watchLaterPlaylist) {
      const newPlaylist = await youtube.playlists.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            title: 'Watch Later (TubePlus)',
            description: 'Videos saved to watch later on TubePlus'
          }
        }
      });
      watchLaterPlaylist = newPlaylist.data;
    }

    // Check if video already exists in playlist
    const existingItems = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId: watchLaterPlaylist.id!,
      maxResults: 50
    });

    const isDuplicate = existingItems.data.items?.some(
      item => item.snippet?.resourceId?.videoId === videoId
    );

    if (isDuplicate) {
      return new NextResponse("Video already in Watch Later", { status: 409 });
    }

    // Add video to playlist
    await youtube.playlistItems.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId: watchLaterPlaylist.id,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId
          }
        }
      }
    });

    return new NextResponse("Added to Watch Later", { status: 200 });
  } catch (error) {
    console.error("Error in watch later API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { videoId } = await req.json();
    const youtube = await getYoutubeClient();

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

    const videos = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId: watchLaterPlaylist.id,
      maxResults: 50
    });

    const videoItem = videos.data.items?.find(
      item => item.snippet?.resourceId?.videoId === videoId
    );

    if (videoItem?.id) {
      await youtube.playlistItems.delete({
        id: videoItem.id
      });
      return NextResponse.json({ message: "Video removed from Watch Later" });
    }

    return new NextResponse("Video not found in Watch Later", { status: 404 });
  } catch (error) {
    return new NextResponse("Failed to remove from Watch Later", { status: 500 });
  }
} 