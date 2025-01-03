"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useChat } from "@/hooks/use-chat";

interface ChatListProps {
  onSelect: (chatId: string) => void;
  selectedId: string | null;
}

export function ChatList({ onSelect, selectedId }: ChatListProps) {
  const { chats, loading } = useChat();

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-2 p-2">
        {chats?.map((chat, i) => (
          <motion.button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl",
              "hover:bg-accent/80 transition-colors",
              "text-left",
              selectedId === chat.id && "bg-accent"
            )}
          >
            <Avatar>
              <AvatarImage src={chat.image} />
              <AvatarFallback>
                {chat.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">{chat.name}</p>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(chat.lastMessage?.createdAt || Date.now()), "HH:mm")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage?.content || 'No messages yet'}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
} 