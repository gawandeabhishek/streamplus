"use client";

import { useEffect, useState } from "react";
import { Video, MoreVertical, Bell, BellOff, UserX, LogOut, Info, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
}

interface ChatInfo {
  name: string;
  memberCount: number;
  isGroup: boolean;
  onlineStatus?: boolean;
}

interface ChatHeaderProps {
  chatId: string;
  onlineUsers: string[];
  otherUser: User;
}

export function ChatHeader({ chatId, onlineUsers, otherUser }: ChatHeaderProps) {
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchChatInfo();
  }, [chatId]);

  const fetchChatInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chats/${chatId}/info`);
      if (response.ok) {
        const data = await response.json();
        setChatInfo(data);
      }
    } catch (error) {
      console.error("Error fetching chat info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMuteToggle = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}/mute`, {
        method: 'POST',
        body: JSON.stringify({ muted: !isMuted })
      });
      
      if (response.ok) {
        setIsMuted(!isMuted);
        toast({
          description: isMuted ? "Chat notifications turned on" : "Chat notifications muted",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update notification settings",
      });
    }
  };

  const handleBlockUser = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}/block`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          description: "User blocked successfully. You won't receive their messages.",
        });
        router.push('/chat'); // Redirect to chat list
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to block user",
      });
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}/leave`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          description: "You've left the group successfully",
        });
        router.push('/chat');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to leave group",
      });
    }
  };

  const handleAddMembers = async () => {
    router.push(`/chat/${chatId}/add-members`);
  };

  return (
    <div className="border-b p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ) : (
          <div>
            <h2 className="font-semibold">{chatInfo?.name}</h2>
            {chatInfo?.isGroup ? (
  chatInfo.memberCount > 0 && (
    <p className="text-sm text-muted-foreground">
      {chatInfo.memberCount} members
    </p>
  )
) : (
  otherUser?.id && onlineUsers?.includes(otherUser.id) && (
    <p className="text-sm text-green-500">Online</p>
  )
)}
          </div>
        )}
      </div>
      {chatId && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {chatInfo?.isGroup ? (
                <>
                  <DropdownMenuItem onClick={() => {}}>
                    <Info className="h-4 w-4 mr-2" />
                    Group details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddMembers}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add participants
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMuteToggle}>
                    {isMuted ? (
                      <Bell className="h-4 w-4 mr-2" />
                    ) : (
                      <BellOff className="h-4 w-4 mr-2" />
                    )}
                    {isMuted ? "Turn on notifications" : "Mute notifications"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLeaveGroup} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Exit group
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => {}}>
                    <Users className="h-4 w-4 mr-2" />
                    Contact info
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMuteToggle}>
                    {isMuted ? (
                      <Bell className="h-4 w-4 mr-2" />
                    ) : (
                      <BellOff className="h-4 w-4 mr-2" />
                    )}
                    {isMuted ? "Turn on notifications" : "Mute notifications"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleBlockUser} className="text-red-600">
                    <UserX className="h-4 w-4 mr-2" />
                    Block contact
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
} 