"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "./message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSkeleton } from "./message-skeleton";
import { Smile, Paperclip, Send, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ChatMessagesProps {
  chatId: string;
  onBack: () => void;
}

export function ChatMessages({ chatId, onBack }: ChatMessagesProps) {
  const { data: session } = useSession();
  const { supabase } = useSupabase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();

  useEffect(() => {
    fetchMessages();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        console.log('Unsubscribing from channel');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [chatId]);

  const setupRealtimeSubscription = async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
    }
    
    channelRef.current = supabase.channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.senderId !== session?.user?.id) {
            setMessages(prev => [...prev, newMessage]);
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      )
      .subscribe();
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setLoading(false);
        messageEndRef.current?.scrollIntoView();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage("");
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <MessageSkeleton />
        <MessageSkeleton isCurrentUser />
        <MessageSkeleton />
        <MessageSkeleton isCurrentUser />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <MessageSkeleton key={i} isCurrentUser={i % 3 === 0} />
            ))
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Message
                  content={message.content}
                  isOwn={message.senderId === session?.user?.id}
                  sender={message.sender}
                  timestamp={message.createdAt}
                />
              </motion.div>
            ))
          )}
        </div>
        <div ref={messageEndRef} />
      </div>

      <div className={cn(
        "sticky bottom-0 border-t",
        "backdrop-blur-md bg-background/80",
        "supports-[backdrop-filter]:bg-background/60"
      )}>
        <form onSubmit={handleSubmit} className="flex items-center gap-4 p-4">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0"
            disabled={isSending}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isSending}
            className="rounded-full bg-primary text-primary-foreground"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}