"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/lib/supabase-client";
import { useSession } from "next-auth/react";

interface FriendRequest {
  id: string;
  userId: string;
  friendId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  type: 'incoming' | 'outgoing';
}

type LoadingState = {
  accept: boolean;
  reject: boolean;
  cancel: boolean;
};

export function FriendRequests() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchRequests();

    const channel = supabaseClient
      .channel('friend_updates')
      .on('broadcast', { event: '*' }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  const fetchRequests = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch("/api/friends/requests", {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched requests:', data);
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleAction = async (requestId: string, action: 'accept' | 'reject' | 'cancel') => {
    setLoadingStates(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [action]: true
      }
    }));
    
    try {
      const endpoint = action === 'accept' 
        ? '/api/friends/accept' 
        : action === 'reject'
        ? '/api/friends/reject'
        : '/api/friends/cancel';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        toast.success(
          action === 'accept' 
            ? 'Friend request accepted' 
            : action === 'reject'
            ? 'Friend request rejected'
            : 'Friend request cancelled'
        );
        setRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        throw new Error('Failed to process request');
      }
    } catch (error) {
      toast.error('Failed to process friend request');
      setLoadingStates(prev => {
        const next = { ...prev };
        if (next[requestId]) {
          next[requestId][action] = false;
        }
        return next;
      });
    }
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const isOutgoingRequest = request.userId === session?.user?.id;
        console.log('Request:', request.id, 'isOutgoing:', isOutgoingRequest);

        return (
          <Card key={request.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={request.user.image || undefined} />
                  <AvatarFallback>{request.user.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{request.user.name}</p>
                  <p className="text-sm text-muted-foreground">{request.user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isOutgoingRequest ? (
                  <Button
                    onClick={() => handleAction(request.id, 'cancel')}
                    disabled={loadingStates[request.id]?.cancel}
                    variant="secondary"
                    size="sm"
                    className="w-[100px]"
                  >
                    {loadingStates[request.id]?.cancel ? (
                      "Loading..."
                    ) : (
                      <>
                        <UserMinus className="h-4 w-4 mr-1" />
                        Requested
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => handleAction(request.id, 'accept')}
                      disabled={loadingStates[request.id]?.accept}
                      size="sm"
                      className="w-[80px]"
                    >
                      {loadingStates[request.id]?.accept ? (
                        "Loading..."
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleAction(request.id, 'reject')}
                      disabled={loadingStates[request.id]?.reject}
                      variant="destructive"
                      size="sm"
                      className="w-[80px]"
                    >
                      {loadingStates[request.id]?.reject ? (
                        "Loading..."
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 