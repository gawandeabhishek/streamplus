"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { supabaseClient, RealtimeMessage } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSkeleton } from "./message-skeleton";
import { Smile, Paperclip, Send, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "./typing-indicator";
import { useSupabase } from "@/providers/supabase-provider";
import { toast } from "sonner";

interface ChatMessagesProps {
  chatId: string;
  onBack: () => void;
}

interface PresenceData {
  presence_ref: string;
  isTyping: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function ChatMessages({ chatId, onBack }: ChatMessagesProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{[key: string]: { name: string | null; image: string | null }}>({});
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const TYPING_TIMEOUT = 3000; // 3 seconds before stopping "is typing"
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchMessages();
    
    const channel = supabaseClient
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage = payload.new as RealtimeMessage;
          if (newMessage.sender_id !== session?.user?.id) {
            setMessages(prev => {
              if (prev.some(msg => msg.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [chatId, session?.user?.id]);

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
      // Check if the message is a watch invite
      const isWatchInvite = newMessage.includes('/watch/');
      const messageType = isWatchInvite ? 'watch_invite' : 'text';

      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newMessage,
          type: messageType,
          metadata: isWatchInvite ? {
            type: 'watch_invite',
            videoId: newMessage.split('/watch/')[1],
            senderId: session?.user?.id,
            senderName: session?.user?.name
          } : undefined
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        // Add special styling for watch invites in the message list
        const newMsg = {
          ...data,
          isWatchInvite: messageType === 'watch_invite'
        };
        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.error('Error response:', data);
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Single effect to handle everything
  useEffect(() => {
    if (!session?.user?.id || !chatId) return;

    const channel = supabaseClient
      .channel(`chat:${chatId}:typing`, {
        config: {
          broadcast: { self: true },
          presence: {
            key: session.user.id,
          },
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typingUsers = Object.entries(state).reduce((acc: { [key: string]: { name: string | null; image: string | null } }, [key, presence]) => {
          const presenceData = presence[0] as PresenceData;
          if (presenceData?.isTyping) {
            acc[key] = {
              name: presenceData.user.name || '',
              image: presenceData.user.image || null
            };
          }
          return acc;
        }, {});
        setTypingUsers(typingUsers);
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          isTyping: Boolean(newMessage.trim()),
          user: {
            id: session.user.id,
            name: session.user.name,
            image: session.user.image
          }
        });
      }
    });

    // Update typing status when message changes
    if (newMessage.trim()) {
      // Immediately show typing
      channel.track({
        isTyping: true,
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image
        }
      });
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout - only clear typing status after 3 seconds of no changes
      typingTimeoutRef.current = setTimeout(() => {
        channel.track({
          isTyping: false,
          user: {
            id: session.user.id,
            name: session.user.name
          }
        });
      }, TYPING_TIMEOUT);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      channel.unsubscribe();
    };
  }, [chatId, session?.user, newMessage]);

  // Convert typing users to array with images
  const typingUsersArray = Object.entries(typingUsers)
    .filter(([userId]) => userId !== session?.user?.id)
    .map(([id, userData]) => ({
      id,
      name: userData.name,
      image: userData.image
    }));

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (payload.new.type === 'watch_invite') {
            toast.info("New watch together invite!", {
              action: {
                label: "View",
                onClick: () => {
                  // Handle navigation to chat
                }
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4 pb-20">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <MessageSkeleton key={i} isCurrentUser={i % 3 === 0} />
            ))
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <ChatMessage
                    message={{
                      content: message.content,
                      senderId: message.sender_id,
                      sender: message.sender,
                      metadata: message.metadata
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {typingUsersArray.length > 0 && (
            <TypingIndicator users={typingUsersArray} />
          )}
        </div>
        <div ref={messageEndRef} />
      </div>

      {/* Sticky Input Area */}
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
            className="flex-1"
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