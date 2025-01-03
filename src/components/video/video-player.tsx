"use client";

import { useState } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
  videoId: string;
  title: string;
}

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const [quality, setQuality] = useState("720p");
  const { isPremium } = useSubscription();

  const qualities = [
    { label: "1080p", requiresPremium: true },
    { label: "720p", requiresPremium: false },
    { label: "480p", requiresPremium: false },
  ];

  return (
    <div className="relative">
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&modestbranding=1`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="absolute bottom-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {quality}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {qualities.map((q) => (
              <DropdownMenuItem
                key={q.label}
                disabled={q.requiresPremium && !isPremium}
                onClick={() => setQuality(q.label)}
              >
                {q.label}
                {quality === q.label && " ✓"}
                {q.requiresPremium && !isPremium && " (Premium)"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 