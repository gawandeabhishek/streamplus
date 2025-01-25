"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface VideoSyncProps {
  videoId: string;
  onTimeUpdate: (time: number) => void;
  onPlayPause: (isPlaying: boolean) => void;
}

const playNotification = async () => {
  try {
    console.log("Playing notification sound");
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    await audio.play();
    console.log("Notification sound played successfully");
  } catch (error) {
    console.error("Failed to play notification:", error);
  }
};

export function VideoSync({ videoId, onTimeUpdate, onPlayPause }: VideoSyncProps) {
  const { supabase } = useSupabase();
  const { data: session } = useSession();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [inviter, setInviter] = useState<{
    name: string;
    image: string | null;
    sessionId: string;
  } | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const setupChannel = async () => {
      const channel = supabase.channel(`watch_invite_${session.user.id}`);
      
      console.log("Setting up watch invite listener for user:", session.user.id);
      
      channel
        .on('broadcast', { event: 'watch_invite' }, async ({ payload }) => {
          console.log("Received invite payload:", payload);
          if (payload.recipientId === session.user.id) {
            console.log("Setting inviter state:", payload);
            setInviter({
              name: payload.senderName,
              image: payload.senderImage,
              sessionId: payload.sessionId
            });
            setShowJoinDialog(true);
            await playNotification();
            toast.info(`${payload.senderName} invited you to watch together!`);
          }
        })
        .on('broadcast', { event: 'invite_sent' }, async () => {
          console.log("Invite sent event received");
          await playNotification();
          toast.success("Watch together invitation sent!");
        });

      const status = await channel.subscribe();
      console.log("Channel subscription status:", status);
    };

    setupChannel();
  }, [session, supabase]);

  useEffect(() => {
    // Debug log for dialog state
    console.log("Dialog state:", { showJoinDialog, inviter });
  }, [showJoinDialog, inviter]);

  const handleJoinSession = async () => {
    if (!session?.user?.id || !inviter?.sessionId) {
      console.log("VideoSync: Missing data", { session, inviter });
      return;
    }

    try {
      console.log("VideoSync: Attempting to join session", {
        sessionId: inviter.sessionId,
        userId: session.user.id
      });

      const { error } = await supabase
        .from('watch_session_participants')
        .insert({
          session_id: inviter.sessionId,
          user_id: session.user.id.toString()
        });

      if (error) throw error;

      setShowJoinDialog(false);
      toast.success("Joined watch session!");

      const channel = supabase.channel(`watch_room_${videoId}`);
      await channel.subscribe();
      
      await channel.send({
        type: 'broadcast',
        event: 'request_video_state',
        payload: {
          videoId,
          requesterId: session.user.id.toString(),
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('VideoSync: Error joining session:', error);
      toast.error("Failed to join session");
    }
  };

  return (
    <>
      <Dialog 
        open={showJoinDialog} 
        onOpenChange={(open) => {
          console.log("Dialog open state changing to:", open);
          setShowJoinDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Watch Together Invitation</DialogTitle>
            <DialogDescription>
              {inviter?.name} invited you to watch this video together
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 my-4">
            <Avatar>
              <AvatarImage src={inviter?.image || undefined} />
              <AvatarFallback>
                {inviter?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{inviter?.name}</span>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              Decline
            </Button>
            <Button onClick={handleJoinSession}>
              Join Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 