"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatHeaderProps {
  otherUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  onlineUsers: { user_id: string; email: string; }[];
  onToggleSidebar: () => void;
  onBack?: () => void;
  isSidebarOpen?: boolean;
  isLoading?: boolean;
}

export function ChatHeader({ 
  otherUser, 
  onlineUsers, 
  onToggleSidebar, 
  onBack,
  isSidebarOpen = true,
  isLoading = false
}: ChatHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const isOnline = onlineUsers?.some(user => user.user_id === otherUser?.id);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="sticky top-0 z-10">
        <div className={cn(
          "h-16 px-4 flex items-center gap-3",
          "backdrop-blur-md bg-background/80 border-b",
          "supports-[backdrop-filter]:bg-background/60"
        )}>
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-10">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "h-16 px-4 flex items-center gap-3",
          "backdrop-blur-md bg-background/80 border-b",
          "supports-[backdrop-filter]:bg-background/60"
        )}
      >
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          {isMobile ? (
            <ArrowLeft className="h-5 w-5" />
          ) : (
            isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )
          )}
        </Button>
        <Avatar>
          <AvatarImage src={otherUser.image || undefined} />
          <AvatarFallback>
            {otherUser.name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{otherUser.name || 'Unknown User'}</p>
          {isOnline && (
            <p className="text-sm text-emerald-500 font-medium">
              Online
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
} 