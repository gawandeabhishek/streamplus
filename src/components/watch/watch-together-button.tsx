"use client";

import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useSupabase } from "@/providers/supabase-provider";

interface Friend {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export function WatchTogetherButton({ videoId }: { videoId: string }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const { supabase } = useSupabase();
  

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchFriends();
    }
  }, [status, session]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends/mutual');
      if (!response.ok) throw new Error('Failed to fetch friends');
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error("Failed to load friends");
    }
  };

  const toggleFriendSelection = (friend: Friend) => {
    setSelectedFriends(prev => 
      prev.some(f => f.id === friend.id)
        ? prev.filter(f => f.id !== friend.id)
        : [...prev, friend]
    );
  };

  const sendWatchInvite = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to invite friends");
      return;
    }

    setIsLoading(true);
    try {
      const { data: watchSession, error: sessionError } = await supabase
        .from('watch_sessions')
        .insert({
          video_id: videoId,
          host_id: session.user.id.toString(),
          is_playing: false,
          playback_time: 0
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const channel = supabase.channel(`watch_room_${videoId}`);
      await channel.subscribe();

      for (const friend of selectedFriends) {
        console.log("Sending invite to:", friend.id);
        await channel.send({
          type: 'broadcast',
          event: 'watch_invite',
          payload: {
            videoId,
            sessionId: watchSession.id,
            senderId: session.user.id.toString(),
            senderName: session.user.name,
            senderImage: session.user.image,
            recipientId: friend.id.toString()
          }
        });
      }

      toast.success(`Invite${selectedFriends.length > 1 ? 's' : ''} sent successfully!`);
      setSelectedFriends([]);
    } catch (error) {
      console.error('Error in sendWatchInvite:', error);
      toast.error("Failed to send invites");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Watch Together
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h3 className="font-semibold">Invite Friends</h3>
            <Input
              type="search"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            <ScrollArea className="h-72">
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => toggleFriendSelection(friend)}
                    className={`flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer ${
                      selectedFriends.some(f => f.id === friend.id) ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={friend.image || undefined} />
                        <AvatarFallback>
                          {friend.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{friend.name}</span>
                        <span className="text-xs text-muted-foreground">{friend.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {selectedFriends.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedFriends.map(friend => (
                    <Badge key={friend.id} variant="secondary">
                      {friend.name}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFriendSelection(friend);
                        }}
                      />
                    </Badge>
                  ))}
                </div>
                <Button 
                  className="w-full" 
                  onClick={sendWatchInvite}
                >
                  Send Invite{selectedFriends.length > 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 