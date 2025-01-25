"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
  videoId: string;
}

export function CopyButton({ videoId }: CopyButtonProps) {
  const handleCopy = () => {
    const baseUrl = window.location.origin;
    const videoUrl = `${baseUrl}/watch/${videoId}`;
    navigator.clipboard.writeText(videoUrl);
    toast.success("Video URL copied to clipboard");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70"
      onClick={handleCopy}
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
} 