"use client";

import { ChatList } from "@/components/chat/chat-list";
import { ChatMessages } from "@/components/chat/chat-messages";
import { SearchInput } from "@/components/chat/search-input";
import { MessageSquare, Send, Plus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChatHeader } from "@/components/chat/chat-header";
import { usePresence } from "@/components/providers/presence-provider";
import { CreateGroupDialog } from "@/components/chat/create-group-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSkeleton } from "@/components/chat/message-skeleton";
import { CreateDMDialog } from "@/components/chat/create-dm-dialog";

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [currentChat, setCurrentChat] = useState<{
    id: string;
    name?: string | null;
    isGroup: boolean;
    participants?: any[];
  } | null>(null);
  const [currentOtherUser, setCurrentOtherUser] = useState<{
    id: string;
    name: string | null;
    image: string | null;
  } | null>(null);
  const { onlineUsers } = usePresence();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateDM, setShowCreateDM] = useState(false);

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
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch chat info");
          return res.json();
        })
        .then((data) => {
          setCurrentChat(data);
          if (!data.isGroup) {
            const otherParticipant = data.participants.find(
              (p: any) => p.userId !== session?.user?.id
            );
            if (otherParticipant) {
              setCurrentOtherUser({
                id: otherParticipant.userId,
                name: otherParticipant.user.name,
                image: otherParticipant.user.image,
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching chat info:", error);
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
          selectedChatId && !showChatList ? "hidden" : "flex",
          "md:flex md:visible",
          !showChatList && "md:hidden"
        )}
      >
        <div className="sticky top-0 z-10 p-4 border-b bg-background">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDM(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Message
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateGroup(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Group
              </Button>
            </div>
          </div>
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
        {isLoading ? (
          <div className="flex-1 p-4">
            <div className="space-y-4">
              {/* Header Skeleton */}
              <div className="flex items-center space-x-4 border-b pb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>

              {/* Messages Skeleton */}
              <div className="space-y-8">
                {[...Array(8)].map((_, i) => (
                  <MessageSkeleton key={i} isCurrentUser={i % 3 === 0} />
                ))}
              </div>
            </div>
          </div>
        ) : selectedChatId && currentChat ? (
          <div className="flex flex-col h-full">
            <ChatHeader
              otherUser={currentOtherUser}
              groupInfo={
                currentChat?.isGroup
                  ? {
                      name: currentChat.name || "Group Chat",
                      participants: currentChat.participants || [],
                    }
                  : undefined
              }
              onlineUsers={onlineUsers?.map((u) => u.user_id) || []}
              onToggleSidebar={handleSidebarToggle}
              onBack={() => setSelectedChatId(null)}
              isSidebarOpen={showChatList}
              isLoading={isLoading}
            />
            <ChatMessages
              chatId={selectedChatId}
              onBack={() => setSelectedChatId(null)}
            />
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
      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        onChatCreated={(chatId) => {
          setSelectedChatId(chatId);
          setShowChatList(false);
        }}
      />
      <CreateDMDialog
        open={showCreateDM}
        onOpenChange={setShowCreateDM}
        onChatCreated={(chatId) => {
          setSelectedChatId(chatId);
          setShowChatList(false);
        }}
      />
    </div>
  );
}
