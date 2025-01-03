import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getYoutubeClient } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const youtube = await getYoutubeClient();
    
    const likedVideos = await youtube.videos.list({
      part: ['id'],
      myRating: 'like',
      maxResults: 50
    });

    if (likedVideos.data.items) {
      await Promise.all(
        likedVideos.data.items.map(video =>
          youtube.videos.rate({
            id: video.id!,
            rating: 'none'
          })
        )
      );
    }

    return new NextResponse("All videos unliked successfully", { status: 200 });
  } catch (error) {
    console.error("Error clearing liked videos:", error);
    return new NextResponse("Failed to clear liked videos", { status: 500 });
  }
} 