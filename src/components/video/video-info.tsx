"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VideoInfoProps {
  video: {
    title: string;
    description: string;
    channelTitle: string;
    channelImage: string;
    publishedAt: string;
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export function VideoInfo({ video }: VideoInfoProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <div className="mt-4 space-y-4">
      <h1 className="text-2xl font-bold">{video.title}</h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={video.channelImage} />
            <AvatarFallback>{video.channelTitle[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{video.channelTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(video.publishedAt))} ago
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <ThumbsUp className="mr-2 h-4 w-4" />
            {video.likeCount}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            {video.commentCount}
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      <div className="rounded-lg bg-muted p-4">
        <p className={`whitespace-pre-wrap ${!isDescriptionExpanded && "line-clamp-3"}`}>
          {video.description}
        </p>
        {video.description.split("\n").length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="mt-2"
          >
            {isDescriptionExpanded ? "Show less" : "Show more"}
          </Button>
        )}
      </div>
    </div>
  );
} 