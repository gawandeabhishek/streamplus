import { NextResponse } from "next/server";
import { getYoutubeClient } from "@/lib/youtube";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    const watchUrlPattern = /\/watch\/([a-zA-Z0-9_-]+)/;
    const match = text.match(watchUrlPattern);
    const videoId = match ? match[1] : null;

    if (!videoId) {
      return NextResponse.json({ preview: null });
    }

    const youtube = await getYoutubeClient();
    
    // Add statistics to get view count
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [videoId]
    });

    const video = response.data.items?.[0];
    if (!video) {
      return NextResponse.json({ preview: null });
    }

    return NextResponse.json({
      preview: {
        id: video.id,
        title: video.snippet?.title,
        thumbnail: video.snippet?.thumbnails?.high?.url,
        channelTitle: video.snippet?.channelTitle,
        views: parseInt(video.statistics?.viewCount || '0'),
        duration: video.contentDetails?.duration
      }
    });
  } catch (error) {
    console.error("Error generating preview:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}