import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getYoutubeClient } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { videoId } = await req.json();
    const youtube = await getYoutubeClient();

    await youtube.videos.rate({
      id: videoId,
      rating: 'none'
    });

    return NextResponse.json({ message: "Video unliked successfully" });
  } catch (error) {
    console.error("Error unliking video:", error);
    return new NextResponse("Failed to unlike video", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();
    const youtube = await getYoutubeClient();

    await youtube.videos.rate({
      id: videoId,
      rating: 'like'
    });

    return NextResponse.json({ message: "Video liked successfully" });
  } catch (error) {
    console.error("Error liking video:", error);
    return new NextResponse("Failed to like video", { status: 500 });
  }
} 