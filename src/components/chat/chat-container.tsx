"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatList } from "./chat-list";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { usePresence } from "@/components/providers/presence-provider";
import { useSession } from "next-auth/react";
import { Search } from "./search";
import { CreateGroupDialog } from "./create-group-dialog";
import { cn } from "@/lib/utils";
// import { Search } from "../search";
// import { CreateGroupDialog } from "../modals/create-group-dialog";

interface ChatContainerProps {
  chatId?: string;
  otherUser?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function ChatContainer({ chatId: initialChatId, otherUser: initialOtherUser }: ChatContainerProps) {
  const { onlineUsers } = usePresence();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(initialChatId);
  const [currentOtherUser, setCurrentOtherUser] = useState(initialOtherUser);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (selectedChatId) {
      fetch(`/api/chat/${selectedChatId}/info`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch chat info');
          return res.json();
        })
        .then(data => {
          if (!data.isGroup) {
            const otherParticipant = data.participants.find(
              (p: any) => p.id !== session?.user?.id
            );
            if (otherParticipant) {
              setCurrentOtherUser({
                id: otherParticipant.id,
                name: otherParticipant.name,
                image: otherParticipant.image
              });
            }
          }
        })
        .catch(error => {
          console.error('Error fetching chat info:', error);
        });
    }
  }, [selectedChatId, session?.user?.id]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <motion.div 
        initial={{ width: 380 }}
        animate={{ width: showLeftSidebar ? 380 : 0 }}
        className={cn(
          "flex flex-col border-r bg-card overflow-hidden",
          !showLeftSidebar && "w-0"
        )}
      >
        <div className="p-4 space-y-4">
          <Search />
          <div className="grid grid-cols-2 gap-2">
            <CreateGroupDialog />
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            >
              <Users className="h-4 w-4" />
              <span>Watch Together</span>
            </Button>
          </div>
        </div>
        <ChatList onSelectChat={setSelectedChatId} />
      </motion.div>

      {/* Main Chat Area */}
      <motion.div
        initial={{ width: "calc(100% - 380px)" }}
        animate={{ width: showLeftSidebar ? "calc(100% - 380px)" : "100%" }}
        className="h-full flex flex-col"
      >
        {selectedChatId && currentOtherUser && (
          <>
            <ChatHeader 
              otherUser={currentOtherUser}
              onlineUsers={onlineUsers}
              onToggleSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
            />
            <ChatMessages 
              chatId={selectedChatId}
              otherUser={currentOtherUser}
              onlineUsers={onlineUsers}
            />
          </>
        )}
      </motion.div>
    </div>
  );
} 