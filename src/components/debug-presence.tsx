"use client";

import { usePresence } from "@/components/providers/presence-provider";
import { useSession } from "next-auth/react";

export function DebugPresence() {
  const { data: session } = useSession();
  const { onlineUsers } = usePresence();

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-sm">
      <div>Current User: {session?.user?.email}</div>
      <div>Online Users: {onlineUsers.length}</div>
      <pre className="mt-2 text-xs">
        {JSON.stringify(onlineUsers, null, 2)}
      </pre>
    </div>
  );
} 