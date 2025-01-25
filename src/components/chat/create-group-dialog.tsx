"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Friend } from "@/types";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated?: (chatId: string) => void;
}

export function CreateGroupDialog({ 
  open, 
  onOpenChange,
  onChatCreated 
}: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const router = useRouter();

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => {
      const isAlreadySelected = prev.includes(friendId);
      
      if (isAlreadySelected) {
        // If removing the first selected friend, clear selectedFriend
        if (selectedFriend === friendId) {
          setSelectedFriend(null);
        }
        return prev.filter(id => id !== friendId);
      } else {
        // If this is the first selection
        if (prev.length === 0) {
          setSelectedFriend(friendId);
        }
        return [...prev, friendId];
      }
    });
  };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // Only fetch mutual friends if we have a selected friend AND more than one selection
        const shouldFetchMutual = selectedFriend && selectedFriends.length > 1;
        const url = shouldFetchMutual
          ? `/api/friends/mutual?selectedFriendId=${selectedFriend}`
          : '/api/friends/mutual';
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch friends");
        const data = await response.json();
        setFriends(prev => {
          // Keep selected friends in the list
          const selectedFriendsData = prev.filter((f: Friend) => selectedFriends.includes(f.id));
          const newFriends = data.filter((f: Friend) => !selectedFriends.includes(f.id));
          return [...selectedFriendsData, ...newFriends];
        });
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    if (open) {
      fetchFriends();
    }
  }, [open, selectedFriend, selectedFriends.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim() || selectedFriends.length < 2) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: groupName,
          participantIds: selectedFriends 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create group");
      }

      toast.success("Group created successfully!");
      onChatCreated?.(data.chatId);
      onOpenChange(false);
      setSelectedFriends([]);
      setGroupName("");
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.message || "Failed to create group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredFriends = useMemo(() => {
    console.log("Filtering friends:", friends, "Query:", searchQuery);
    return friends.filter(friend => 
      friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a new group chat with your mutual friends.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Friends (minimum 2)</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {/* Selected Friends Capsules */}
              {selectedFriends.length > 0 && (
                <div className="flex flex-wrap gap-2 my-3 pb-2 border-b">
                  {selectedFriends.map(friendId => {
                    const friend = friends.find(f => f.id === friendId);
                    return (
                      <div
                        key={friendId}
                        className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full"
                      >
                        <span className="text-sm">{friend?.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleFriend(friendId)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <ScrollArea className="h-[200px] border rounded-md">
                <div className="space-y-2 p-2">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={cn(
                        "flex items-center space-x-2 p-3 hover:bg-accent rounded-md cursor-pointer",
                        selectedFriends.includes(friend.id) && "bg-accent"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={friend.image || undefined} />
                        <AvatarFallback>
                          {friend.name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{friend.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={selectedFriends.length < 2 || !groupName.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 