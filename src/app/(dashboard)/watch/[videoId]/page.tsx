import { Metadata } from "next";
import { getYoutubeClient } from "@/lib/youtube";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { WatchActions } from "@/components/watch/watch-actions";
import { formatCompactNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import Linkify from 'linkify-react';
import Link from 'next/link';

interface WatchPageProps {
  params: {
    videoId: string;
  };
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const youtube = await getYoutubeClient();
  const video = await youtube.videos.list({
    part: ['snippet'],
    id: [params.videoId]
  });

  const title = video.data.items?.[0]?.snippet?.title || 'Watch';
  
  return {
    title: `${title} | TubePlus`,
    description: video.data.items?.[0]?.snippet?.description || 'Watch video together',
  };
}

function formatDescription(text: string) {
  // First handle hashtags
  const withHashtags = text.replace(
    /#[\w\u0590-\u05ff]+/g,
    match => `<a href="/explore?q=${encodeURIComponent(match)}" class="text-blue-500 hover:underline cursor-pointer">${match}</a>`
  );

  // Then handle URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const withLinks = withHashtags.replace(
    urlRegex,
    url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`
  );

  return (
    <p 
      className="text-sm text-muted-foreground whitespace-pre-wrap [&_a]:text-blue-500 [&_a]:hover:underline"
      dangerouslySetInnerHTML={{ __html: withLinks }}
    />
  );
}

export default async function WatchPage({ params }: WatchPageProps) {
  const youtube = await getYoutubeClient();
  const video = await youtube.videos.list({
    part: ['snippet', 'statistics'],
    id: [params.videoId]
  });

  const videoData = video.data.items?.[0];
  if (!videoData) return null;

  const publishedAt = new Date(videoData.snippet?.publishedAt || '');
  const viewCount = formatCompactNumber(parseInt(videoData.statistics?.viewCount || '0'));
  const likeCount = formatCompactNumber(parseInt(videoData.statistics?.likeCount || '0'));

  return (
    <DashboardShell>
      <div className="container max-w-7xl py-6 space-y-6">
        <Card className="overflow-hidden bg-black">
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${params.videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0"
            />
          </div>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h1 className="text-2xl font-bold leading-tight">
                    {videoData.snippet?.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="font-medium">{videoData.snippet?.channelTitle}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(publishedAt, { addSuffix: true })}</span>
                  </div>
                </div>
                <WatchActions videoId={params.videoId} />
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{viewCount} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{likeCount} likes</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Description</h2>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                  {formatDescription(videoData.snippet?.description || '')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
} 