"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
}

interface CreateDMDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (chatId: string) => void;
}

export function CreateDMDialog({ open, onOpenChange, onChatCreated }: CreateDMDialogProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (query.length < 3) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setUsers(data.filter((user: User) => user.id !== session?.user?.id));
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = async (userId: string) => {
    try {
      const response = await fetch("/api/chats/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) throw new Error("Failed to create chat");
      
      const chat = await response.json();
      onChatCreated(chat.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create DM:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 px-0"
            />
          </div>
          <ScrollArea className="h-[300px] pr-4">
            {users.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start px-2 py-6"
                onClick={() => handleSelectUser(user.id)}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </Button>
            ))}
            {search.length >= 3 && users.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
} 