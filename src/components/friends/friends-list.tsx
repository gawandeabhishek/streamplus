"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users, Check, UserMinus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabaseClient } from "@/lib/supabase-client";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export function FriendsList() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendStates, setFriendStates] = useState<Map<string, string>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (searchQuery.length >= 3) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initial fetch
    fetchFriends();
    fetchFriendStates();

    const channel = supabaseClient
      .channel('friend_updates')
      .on('broadcast', { event: '*' }, async (payload) => {
        console.log('Received update:', payload);
        
        // Immediately fetch new data when friend request is accepted
        if (payload.payload.status === 'accepted') {
          await Promise.all([
            fetchFriends(),
            fetchFriendStates()
          ]);
        }
        
        // For other updates
        fetchFriendStates();
        fetchFriends();
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Poll for updates every 10 seconds as a fallback
    const interval = setInterval(() => {
      fetchFriends();
      fetchFriendStates();
    }, 10000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [session?.user?.id]);

  const fetchFriendStates = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch("/api/friends/states", {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setFriendStates(new Map(Object.entries(data)));
      }
    } catch (error) {
      console.error("Error fetching friend states:", error);
    }
  };

  const fetchFriends = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch("/api/friends", {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await fetch(`/api/users/search?q=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleFriendAction = async (userId: string) => {
    setLoadingStates(prev => ({ ...prev, [userId]: true }));
    try {
      const currentState = friendStates.get(userId);

      if (currentState === 'accepted') {
        const response = await fetch("/api/friends/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friendId: userId }),
        });

        if (response.ok) {
          setFriendStates(prev => {
            const next = new Map(prev);
            next.set(userId, 'none');
            return next;
          });
          setFriends(prev => prev.filter(f => f.id !== userId));
          toast.success("Friend removed");
        }
      } else {
        const response = await fetch("/api/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friendId: userId }),
        });

        if (response.ok) {
          setFriendStates(prev => {
            const next = new Map(prev);
            next.set(userId, 'pending');
            return next;
          });
          toast.success("Friend request sent");
        }
      }
    } catch (error) {
      toast.error("Failed to update friend status");
    } finally {
      setLoadingStates(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  const getButtonProps = (userId: string) => {
    const state = friendStates.get(userId);
    if (loadingStates[userId]) {
      return {
        disabled: true,
        children: "Loading..."
      };
    }
    
    switch (state) {
      case 'accepted':
        return {
          variant: "destructive" as const,
          onClick: () => handleFriendAction(userId),
          children: (
            <>
              <UserMinus className="h-4 w-4 mr-1" />
              Remove
            </>
          )
        };
      case 'pending':
        return {
          variant: "secondary" as const,
          disabled: true,
          children: (
            <>
              <Check className="h-4 w-4 mr-1" />
              Requested
            </>
          )
        };
      default:
        return {
          variant: "default" as const,
          onClick: () => handleFriendAction(userId),
          children: (
            <>
              <UserPlus className="h-4 w-4 mr-1" />
              Add Friend
            </>
          )
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Your Friends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="space-y-4">
          <AnimatePresence>
            {searchQuery.length >= 3 ? (
              users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    {...getButtonProps(user.id)}
                    className="transition-all duration-300"
                  />
                </motion.div>
              ))
            ) : (
              friends.map((friend) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friend.image || ""} />
                      <AvatarFallback>
                        {friend.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">{friend.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleFriendAction(friend.id)}
                    className="transition-all duration-300"
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
} 