"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useChat } from "@/hooks/use-chat";
import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useSession } from "next-auth/react";

interface ChatListProps {
  onSelect: (chatId: string) => void;
  selectedId?: string | null;
}

export function ChatList({ onSelect, selectedId }: ChatListProps) {
  const [chats, setChats] = useState<any[]>([]);
  const { supabase } = useSupabase();
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initial fetch
    fetchChats();

    // Set up real-time subscriptions for both Chat and ChatParticipant tables
    const chatChannel = supabase
      .channel('chat-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Chat',
        filter: `participants->>'userId'=eq.${session.user.id}`,
      }, () => {
        fetchChats();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ChatParticipant',
        filter: `userId=eq.${session.user.id}`,
      }, () => {
        fetchChats();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Message',
      }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [session?.user?.id, supabase]);

  const fetchChats = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

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