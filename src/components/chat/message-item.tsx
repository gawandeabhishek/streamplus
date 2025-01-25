"use client";

import { Message } from "@/types";
import { useRouter } from "next/navigation";

export function MessageItem({ message }: { message: Message }) {
  const router = useRouter();

  const handleWatchInvite = () => {
    if (message.type === 'watch_invite') {
      const videoUrl = message.content.split(' ').pop();
      if (videoUrl) {
        router.push(videoUrl);
      }
    }
  };

  return (
    <div 
      className={`p-3 rounded-lg ${
        message.type === 'watch_invite' 
          ? 'bg-blue-500/10 cursor-pointer hover:bg-blue-500/20' 
          : 'bg-muted'
      }`}
      onClick={message.type === 'watch_invite' ? handleWatchInvite : undefined}
    >
      <p className="text-sm">
        {message.type === 'watch_invite' ? (
          <>
            <span className="font-semibold text-blue-500">Watch Invite:</span>{' '}
            {message.content}
          </>
        ) : (
          message.content
        )}
      </p>
    </div>
  );
} 