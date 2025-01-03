"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

interface PresenceProviderProps {
  children: (onlineUsers: string[]) => React.ReactNode;
}

interface PresencePayload {
  new: {
    user_id: string;
  };
  old?: {
    user_id: string;
  };
}

export function PresenceProvider({ children }: PresenceProviderProps) {
  const { data: session } = useSession();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      const updatePresence = async () => {
        await supabase.from("presence").upsert({
          user_id: session.user.id,
          online_at: document.hasFocus() ? new Date().toISOString() : null,
        });
      };

      window.addEventListener("focus", updatePresence);
      window.addEventListener("blur", updatePresence);

      // Initial presence update
      updatePresence();

      // Subscribe to presence changes
      // Change this part:
      const presenceSubscription = supabase
        .channel("presence_channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "presence",
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setOnlineUsers((prev) => [...prev, payload.new.user_id]);
            } else if (payload.eventType === "DELETE") {
              setOnlineUsers((prev) =>
                prev.filter((id) => id !== payload.old?.user_id)
              );
            }
          }
        )
        .subscribe();

      // And update cleanup:
      return () => {
        window.removeEventListener("focus", updatePresence);
        window.removeEventListener("blur", updatePresence);
        presenceSubscription.unsubscribe();
      };
    }
  }, [session?.user?.id]);

  return <>{children(onlineUsers)}</>;
}
