"use client";

import { ChatList } from "@/components/chat/chat-list";
import { ChatMessages } from "@/components/chat/chat-messages";
import { SearchInput } from "@/components/chat/search-input";
import { MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChatHeader } from "@/components/chat/chat-header";
import { usePresence } from "@/components/providers/presence-provider";

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [currentOtherUser, setCurrentOtherUser] = useState<{
    id: string;
    name: string | null;
    image: string | null;
  } | null>(null);
  const { onlineUsers } = usePresence();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSidebarToggle = () => {
    if (window.innerWidth < 768) {
      setSelectedChatId(null);
    } else {
      setShowChatList(!showChatList);
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      setIsLoading(true);
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
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [selectedChatId, session?.user?.id]);


  return (
    <div className="relative flex h-screen">
      {/* Chat List Sidebar */}
      <aside 
        className={cn(
          "w-full md:w-[320px] flex flex-col",
          "fixed md:static inset-0",
          "border-r",
          "z-40",
          (selectedChatId && !showChatList) ? "hidden" : "flex",
          "md:flex md:visible",
          !showChatList && "md:hidden"
        )}
      >
        <div className="sticky top-0 z-10 p-4 border-b bg-background">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <SearchInput />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList 
            onSelect={(id) => {
              setSelectedChatId(id);
              setShowChatList(false);
            }} 
            selectedId={selectedChatId}
          />
        </div>
      </aside>

      {/* Main Chat Area */}
      <main 
        className={cn(
          "w-full md:w-[calc(100%-320px)] flex flex-col bg-background",
          "fixed md:static inset-0",
          selectedChatId ? "flex" : "hidden md:flex",
          !showChatList && "md:w-full"
        )}
      >
        {selectedChatId && currentOtherUser ? (
          <div className="flex flex-col h-full">
            <ChatHeader 
              otherUser={currentOtherUser}
              onlineUsers={onlineUsers || []}
              onToggleSidebar={handleSidebarToggle}
              onBack={() => setSelectedChatId(null)}
              isSidebarOpen={showChatList}
              isLoading={isLoading}
            />

            <div className="flex-1 overflow-y-auto">
              <ChatMessages 
                chatId={selectedChatId} 
                onBack={() => setSelectedChatId(null)}
              />
            </div>

            {/* <div className="sticky bottom-0 border- bg-backgound">
              <div className="flex items-center gap-2 p-2">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className="flex-1 rounded-full px-4 py-2 bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button className="p-2 bg-primary text-primary-foreground rounded-full">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div> */}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="p-4 rounded-full bg-accent/10 inline-block">
                <MessageSquare className="w-8 h-8 text-accent-foreground/60" />
              </div>
              <h3 className="text-lg font-medium">Your Messages</h3>
              <p className="text-sm text-muted-foreground max-w-[180px]">
                Select a conversation or start a new one
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 