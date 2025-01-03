"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Smile, Paperclip, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./chat-header";
import { ChatMessage } from "./chat-message";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    image: string;
  };
  createdAt: string;
}

interface VideoAttachment {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  viewCount: string;
}

interface ChatMessagesProps {
  chatId: string;
  onlineUsers: string[];
  otherUser: {
    id: string;
    name: string;
  };
}

export function ChatMessages({ chatId, onlineUsers, otherUser }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const messageIdsRef = useRef(new Set<string>());
  const [loading, setLoading] = useState(true);

  // Function to check if user is near bottom
  const isNearBottom = () => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return true;
    
    const threshold = 100; // pixels from bottom
    const position = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight;
    return position < threshold;
  };

  // Enhanced scroll to bottom function
  const scrollToBottom = (force = false) => {
    if (force || isNearBottom()) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 100);
    }
  };

  useEffect(() => {
    fetchMessages();
    messageIdsRef.current.clear();

    const channel = supabase.channel(`room:${chatId}`)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        if (payload.sender.id !== session?.user?.id) {
          if (!messageIdsRef.current.has(payload.id)) {
            messageIdsRef.current.add(payload.id);
            setMessages(prev => [...prev, payload]);
            scrollToBottom();
          }
        }
      })
      .subscribe();

    return () => {
      supabase.channel(`room:${chatId}`).unsubscribe();
    };
  }, [chatId, session?.user?.id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        data.forEach((msg: Message) => messageIdsRef.current.add(msg.id));
        setMessages(data);
        // Force scroll to bottom on initial load
        scrollToBottom(true);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (content: string): string | null => {
    // Match your website's video URL pattern
    const match = content.match(/\/watch\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const videoId = extractVideoId(newMessage);
      let videoAttachment: VideoAttachment | undefined;

      if (videoId) {
        // Fetch video details if it's a video link
        const videoResponse = await fetch(`/api/videos/${videoId}`);
        if (videoResponse.ok) {
          videoAttachment = await videoResponse.json();
        }
      }

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newMessage,
          videoAttachment 
        }),
      });

      if (response.ok) {
        const message = await response.json();
        if (!messageIdsRef.current.has(message.id)) {
          messageIdsRef.current.add(message.id);
          setMessages(prev => [...prev, message]);
          scrollToBottom(true);
        }
        setNewMessage("");
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const messageVariants = {
    initial: { opacity: 0, y: 50, scale: 0.8 },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const MessageSkeleton = ({ position }: { position: 'start' | 'end' }) => (
    <div className={`flex items-start gap-4 p-4 ${position === 'end' ? 'flex-row-reverse' : ''}`}>
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className={`flex flex-col gap-1 ${position === 'end' ? 'items-end' : 'items-start'}`}>
        {position === 'start' && <Skeleton className="h-4 w-20" />}
        <div className={cn(
          "rounded-lg p-3 bg-muted"
        )}>
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[180px] mt-2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/80">
      <ChatHeader chatId={chatId} onlineUsers={onlineUsers} otherUser={otherUser} />
      
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full p-4 pb-2" ref={scrollAreaRef}>
          <div className="space-y-4">
            {loading ? (
              <>
                <MessageSkeleton position="start" />
                <MessageSkeleton position="end" />
                <MessageSkeleton position="start" />
                <MessageSkeleton position="end" />
                <MessageSkeleton position="start" />
                <MessageSkeleton position="end" />
                <MessageSkeleton position="start" />
                <MessageSkeleton position="end" />
                <MessageSkeleton position="start" />
              </>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                >
                  <ChatMessage message={{
                    content: message.content,
                    senderId: message.sender.id,
                    sender: {
                      name: message.sender.name,
                      image: message.sender.image
                    }
                  }} />
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <motion.form 
        onSubmit={handleSubmit}
        className="sticky bottom-4 z-10 p-4 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        layout
      >
        <div className="flex items-center gap-2 max-w-[1200px] mx-auto">
          <Button 
            type="button" 
            size="icon" 
            variant="ghost"
            className="flex-shrink-0"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button 
            type="button" 
            size="icon" 
            variant="ghost"
            className="flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          
          <Button 
            type="submit" 
            size="icon"
            disabled={isSending || !newMessage.trim()}
            className="flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
      </div>
      </motion.form>
    </div>
  );
}