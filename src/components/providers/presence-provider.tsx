"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "./supabase-provider";
import { useSession } from "next-auth/react";

type PresenceContextType = {
  onlineUsers: { user_id: string; email: string; }[];
};

const PresenceContext = createContext<PresenceContextType>({ onlineUsers: [] });

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<{ user_id: string; email: string; }[]>([]);
  const { supabase } = useSupabase();
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.email) return;

    const channel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const presenceArray = Object.values(newState)
          .flat()
          .map(presence => presence as unknown as { user_id: string; email: string; });
        setOnlineUsers(presenceArray);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: session.user.id,
            email: session.user.email,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, supabase]);

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
}

export const usePresence = () => useContext(PresenceContext);
