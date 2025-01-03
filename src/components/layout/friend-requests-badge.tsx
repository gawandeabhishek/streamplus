"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "../ui/badge";
import { useSession } from "next-auth/react";
import { supabaseClient } from "@/lib/supabase-client";

export function FriendRequestsBadge() {
  const [count, setCount] = useState(0);
  const { data: session } = useSession();

  const fetchPendingRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch("/api/friends/pending-count", {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setCount(0);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) {
      setCount(0);
      return;
    }

    fetchPendingRequests();

    // Subscribe to all friend-related events
    const channel = supabaseClient
      .channel('friend_updates')
      .on('broadcast', { event: '*' }, () => {
        console.log('Received friend update event, fetching new count...');
        fetchPendingRequests();
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Poll for updates every 30 seconds as a fallback
    const interval = setInterval(fetchPendingRequests, 30000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
      setCount(0);
    };
  }, [session?.user?.id, fetchPendingRequests]);

  if (count === 0) return null;

  return (
    <Badge 
      className="h-4 w-4 text-[10px] flex items-center justify-center p-0 rounded-full bg-green-500 text-white border-none"
    >
      {count}
    </Badge>
  );
} 