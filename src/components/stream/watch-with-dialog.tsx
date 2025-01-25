"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WatchWithDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export function WatchWithDialog({ open, onOpenChange, videoId }: WatchWithDialogProps) {
  const [friends, setFriends] = useState<any[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      fetchFriends();
    }
  }, [session?.user?.id]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      const dmChats = data.filter((chat: any) => !chat.isGroup);
      const friendsList = dmChats.map((chat: any) => {
        const friend = chat.participants.find(
          (p: any) => p.userId !== session?.user?.id
        );
        return friend?.user;
      }).filter(Boolean);
      setFriends(friendsList);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleSelectFriend = async (friend: any) => {
    try {
      // First, get or create DM chat
      const chatResponse = await fetch("/api/chats/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: friend.id }),
      });
      const chat = await chatResponse.json();

      // Send watch request message
      const messageResponse = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.id,
          content: "WATCH_REQUEST",
          metadata: {
            type: "watch_request",
            videoId,
            senderId: session?.user?.id,
            senderName: session?.user?.name
          }
        }),
      });

      if (!messageResponse.ok) throw new Error();

      toast.success(`Watch request sent to ${friend.name}`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to send watch request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Friend to Watch</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {friends.map((friend) => (
              <Button
                key={friend.id}
                variant="ghost"
                className="w-full justify-start px-2 py-6"
                onClick={() => handleSelectFriend(friend)}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={friend.image || undefined} />
                  <AvatarFallback>
                    {friend.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{friend.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {friend.email}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 