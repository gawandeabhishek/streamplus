import { NextResponse } from "next/server";
import { getYoutubeClient } from "@/lib/youtube";

export async function GET(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const youtube = await getYoutubeClient();
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [params.videoId]
    });

    const video = response.data.items?.[0];
    if (!video) {
      return new NextResponse("Video not found", { status: 404 });
    }

    return NextResponse.json({
      id: video.id,
      title: video.snippet?.title,
      thumbnail: video.snippet?.thumbnails?.high?.url,
      duration: video.contentDetails?.duration,
      channelTitle: video.snippet?.channelTitle,
      viewCount: video.statistics?.viewCount
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 