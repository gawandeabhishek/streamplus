import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${params.videoId}&format=json`
    ).then(res => res.json());

    if (!oembedResponse) {
      return new NextResponse("Video not found", { status: 404 });
    }

    return NextResponse.json({
      id: params.videoId,
      title: oembedResponse.title,
      thumbnail: oembedResponse.thumbnail_url,
      channelTitle: oembedResponse.author_name,
      duration: "PT0M0S",
      views: 0,
      html: oembedResponse.html
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 