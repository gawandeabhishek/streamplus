"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

interface Chat {
  id: string;
  initiator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    image: string | null;
  };
  messages: {
    content: string;
    createdAt: string;
  }[];
}

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
}

const formatTimeAgo = (timestamp: Date | string) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} d`;
  return `${Math.floor(diffInSeconds / 604800)}w`;
};

export function ChatList({ onSelectChat }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const session = useSession();
  const currentUserId = session.data?.user?.id;

  useEffect(() => {
  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
        const data = await response.json();
        setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

    fetchChats();
  }, []);

  const handleSelectChat = (chatId: string) => {
    setSelectedId(chatId);
    onSelectChat(chatId);
  };

  const getOtherUser = (chat: Chat) => {
    if (chat.initiator.id === currentUserId) {
      return chat.receiver;
    }
    return chat.initiator;
  };

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-2 p-2">
        {chats.map((chat) => {
          const otherUser = getOtherUser(chat);
          return (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                "w-full",
                selectedId === chat.id && "bg-accent"
              )}
              onClick={() => handleSelectChat(chat.id)}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={otherUser?.image || ""} />
                <AvatarFallback>
                  {otherUser?.name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between w-[80%]">
                  <p className="font-medium truncate max-w-[180px]">
                    {otherUser?.name || 'Unknown User'}
                  </p>
                  {chat.messages[0]?.createdAt && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTimeAgo(chat.messages[0].createdAt)}
                    </span>
                  )}
                </div>
                {chat.messages[0]?.content && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {chat.messages[0].content}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
} 