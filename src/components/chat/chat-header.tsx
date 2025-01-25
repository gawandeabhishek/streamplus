"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface ChatHeaderProps {
  otherUser?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  groupInfo?: {
    name: string;
    participants: {
      userId: string;
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
    }[];
  };
  onlineUsers: string[];
  onToggleSidebar: () => void;
  onBack: () => void;
  isSidebarOpen: boolean;
  isLoading: boolean;
}

export function ChatHeader({
  otherUser,
  groupInfo,
  onlineUsers,
  onToggleSidebar,
  onBack,
  isSidebarOpen,
  isLoading
}: ChatHeaderProps) {
  useEffect(() => {
    if (groupInfo) {
      console.log('Full participants data:', groupInfo.participants);
      console.log('Online users:', onlineUsers);
    }
  }, [groupInfo, onlineUsers]);

  if (isLoading) {
    return (
      <header className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Skeleton className="h-10 w-10" />
          </div>
          <Skeleton className="h-10 w-10" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 bg-background border-b p-4">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden md:inline-flex"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {groupInfo ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {groupInfo.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{groupInfo.name}</p>
              <p className="text-xs text-muted-foreground">
                {groupInfo.participants.filter(p => onlineUsers.includes(p.id)).length > 0 && (
                  <span className="text-emerald-500">
                    {groupInfo.participants.filter(p => onlineUsers.includes(p.id)).length} online
                  </span>
                )}
                <span className="text-muted-foreground">
                  {groupInfo.participants.filter(p => onlineUsers.includes(p.id)).length > 0 && ' • '}
                  {groupInfo.participants.length} members
                </span>
              </p>
            </div>
          </div>
        ) : otherUser && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={otherUser.image || undefined} />
              <AvatarFallback>
                {otherUser.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{otherUser.name}</p>
              {onlineUsers.includes(otherUser.id) && (
                <p className="text-xs">
                  <span className="text-emerald-500">online</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 