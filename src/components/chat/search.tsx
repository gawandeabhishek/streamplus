"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search as SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string;
  image: string | null;
}

export function Search() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  const searchUsers = async (query: string) => {
    if (!query) {
      setUsers([]);
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const startChat = async (friendId: string) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });

      if (response.ok) {
        toast({
          title: "Chat started",
          description: "You can now start messaging",
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 border-b space-y-4">
      <Input
        placeholder="Search messages..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            <Users className="h-4 w-4" />
            New Chat
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Chat</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Input
              placeholder="Search users..."
              onChange={(e) => searchUsers(e.target.value)}
            />
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startChat(user.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={user.image ?? ""} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 