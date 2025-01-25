"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";

interface StreamChatProps {
  streamId: string;
}

export function StreamChat({ streamId }: StreamChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { supabase } = useSupabase();
  const { data: session } = useSession();

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel(`stream:${streamId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_messages',
        filter: `stream_id=eq.${streamId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    // Fetch existing messages
    fetchMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('stream_messages')
      .select(`
        *,
        user:users(id, name, image)
      `)
      .eq('stream_id', streamId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    try {
      await supabase.from('stream_messages').insert({
        content: newMessage,
        stream_id: streamId,
        user_id: session.user.id
      });
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Stream Chat</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.user?.image} />
                <AvatarFallback>
                  {message.user?.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{message.user?.name}</p>
                <p className="text-sm text-muted-foreground">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
} 