import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactLinkify from 'react-linkify';
import { useEffect, useState } from "react";
import { VideoCard } from "./video-card";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoPreview {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  views: number;
  duration: string;
}

interface ChatMessageProps {
  message: {
    content: string;
    senderId: string;
    sender: {
      name: string | null;
      image: string | null;
    };
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { data: session } = useSession();
  const [videoPreview, setVideoPreview] = useState<VideoPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isCurrentUser = message.senderId === session?.user.id;

  useEffect(() => {
    const fetchVideoPreview = async () => {
      const videoId = extractYouTubeVideoId(message.content);
      
      if (videoId) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/videos/${videoId}`);
          if (!response.ok) throw new Error('Failed to fetch video preview');
          const data = await response.json();
          
          setVideoPreview({
            id: videoId,
            title: data.title,
            thumbnail: data.thumbnail,
            duration: data.duration,
            views: data.viewCount,
            channelTitle: data.channelTitle
          });
        } catch (error) {
          console.error('Error fetching video:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchVideoPreview();
  }, [message.content]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const componentDecorator = (href: string, text: string, key: number) => (
    <a href={href} key={key} className="text-blue-500 hover:underline">
      {text}
    </a>
  );

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-start gap-4 p-4",
        isCurrentUser && "flex-row-reverse"
      )}>
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className={cn(
          "flex flex-col gap-2",
          isCurrentUser && "items-end"
        )}>
          {!isCurrentUser && (
            <Skeleton className="h-4 w-[120px]" />
          )}
          <Skeleton className={cn(
            "h-16 w-[250px] rounded-lg",
            isCurrentUser ? "ml-auto" : "mr-auto"
          )} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-start gap-4 p-4", 
      isCurrentUser && "flex-row-reverse"
    )}>
      <Avatar className="flex-shrink-0">
        <AvatarImage 
          src={isCurrentUser ? session?.user?.image || "" : message.sender.image || ""} 
        />
        <AvatarFallback>
          {isCurrentUser 
            ? getInitials(session?.user?.name || null) 
            : getInitials(message.sender.name)}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        "flex flex-col gap-1",
        isCurrentUser && "items-end"
      )}>
        {!isCurrentUser && (
          <span className="text-sm text-muted-foreground">
            {message.sender.name}
          </span>
        )}
        <div className={cn(
          "rounded-lg p-3 max-w-[350px]",
          isCurrentUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          <ReactLinkify componentDecorator={componentDecorator}>
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </ReactLinkify>
          {!isLoading && videoPreview && (
            <div className="mt-3">
              <VideoCard
                videoId={videoPreview.id}
                title={videoPreview.title}
                thumbnail={videoPreview.thumbnail}
                duration={videoPreview.duration}
                views={videoPreview.views}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to extract video ID from YouTube URL
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /\/watch\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}