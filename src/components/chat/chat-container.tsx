"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatList } from "./chat-list";
import { PresenceProvider } from "@/components/providers/presence-provider";

interface User {
  id: string;
  name: string;
}

interface ChatContainerProps {
  chatId: string;
  otherUser: User;
}

export function ChatContainer({ chatId, otherUser }: ChatContainerProps) {
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  return (
    <PresenceProvider>
      {(onlineUsers) => (
        <div className="flex h-[calc(100vh-4rem)] bg-background justify-center">
          <div className="flex w-full max-w-7xl mx-auto">
            {/* Left Sidebar - Chat List */}
            <motion.div 
              initial={{ width: 380 }}
              animate={{ width: 380 }}
              className="flex flex-col border-r bg-card"
            >
              <ChatList onSelectChat={setSelectedChatId} />
            </motion.div>

            {/* Main Chat Area */}
            <motion.div 
              className="flex-1 flex flex-col bg-background min-w-[500px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ChatHeader chatId={chatId} onlineUsers={onlineUsers} otherUser={otherUser} />
              <AnimatePresence mode="wait">
                {selectedChatId ? (
                  <motion.div 
                    key={selectedChatId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full"
                  >
                    <ChatMessages chatId={selectedChatId} onlineUsers={onlineUsers} otherUser={otherUser} />
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-muted-foreground"
                  >
                    <h3 className="text-xl font-semibold mb-2">Select a conversation or start a new one</h3>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right Sidebar - Currently Watching */}
            {showRightSidebar && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l bg-card"
              >
                {/* Currently Watching Component Here */}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </PresenceProvider>
  );
} 