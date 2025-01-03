"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";

interface WatchTogetherProps {
  videoId: string;
}

export function WatchTogether({ videoId }: WatchTogetherProps) {
  const [roomId, setRoomId] = useState("");
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const watchUrl = `${window.location.origin}/watch/${videoId}?room=${roomId}`;

  useEffect(() => {
    const roomFromUrl = searchParams.get("room");
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
      joinRoom(roomFromUrl);
    }
  }, [searchParams]);

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(7);
    setRoomId(newRoomId);
    joinRoom(newRoomId);
  };

  const joinRoom = (room: string) => {
    const socket = io(process.env.NEXT_PUBLIC_APP_URL!, {
      path: "/api/socket",
    });

    socket.emit("join-room", room);

    socket.on("video-update", ({ action, timestamp }) => {
      // Handle video sync updates
      const videoElement = document.querySelector("iframe");
      if (videoElement) {
        // Update video state based on received action
      }
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(watchUrl);
    toast({
      description: "Watch together link copied to clipboard!",
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <Button onClick={createRoom}>
          <Users className="mr-2 h-4 w-4" />
          Create Watch Room
        </Button>
        {roomId && (
          <>
            <Input value={watchUrl} readOnly />
            <Button variant="outline" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      {roomId && (
        <div className="text-sm text-muted-foreground">
          <p>Room ID: {roomId}</p>
          <p>Share the link with friends to watch together!</p>
        </div>
      )}
    </div>
  );
} 