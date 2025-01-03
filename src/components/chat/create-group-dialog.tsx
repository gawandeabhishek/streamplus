"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface Friend {
  id: string;
  name: string | null;
  image: string | null;
}

export function CreateGroupDialog({ friends = [] }: { friends?: Friend[] }) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [availableFriends, setAvailableFriends] = useState<Friend[]>(friends);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setGroupName("");
      setSearchQuery("");
      setSelectedFriends([]);
      setAvailableFriends(friends);
    }
  }, [open, friends]);

  // Update available friends based on mutual connections
  useEffect(() => {
    const updateAvailableFriends = async () => {
      if (selectedFriends.length > 0) {
        try {
          const response = await fetch('/api/friends/mutual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              friendIds: selectedFriends.map(f => f.id)
            })
          });
          
          if (response.ok) {
            const mutualFriends = await response.json();
            setAvailableFriends(mutualFriends);
          }
        } catch (error) {
          console.error('Error fetching mutual friends:', error);
        }
      } else {
        setAvailableFriends(friends);
      }
    };

    updateAvailableFriends();
  }, [selectedFriends, friends]);

  const filteredFriends = useMemo(() => {
    return availableFriends.filter(friend => 
      friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedFriends.some(selected => selected.id === friend.id)
    );
  }, [availableFriends, searchQuery, selectedFriends]);

  const isCreateDisabled = 
    isLoading || 
    !groupName.trim() || 
    selectedFriends.length < 2 || // Minimum 3 total members (including current user)
    friends.length < 2; // Need at least 2 friends to create a group

  const handleRemoveFriend = (friendId: string) => {
    setSelectedFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length < 2) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/chats/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          memberIds: selectedFriends.map(f => f.id)
        }),
      });

      if (!response.ok) throw new Error();

      toast({ description: "Group created successfully!" });
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to create group",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          disabled={friends.length < 2}
        >
          <Users className="h-4 w-4" />
          <span>New Group Chat</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          
          {/* Selected Friends */}
          {selectedFriends.length > 0 && (
            <ScrollArea className="max-h-20">
              <div className="flex flex-wrap gap-2 p-2">
                {selectedFriends.map((friend) => (
                  <Badge 
                    key={friend.id} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {friend.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveFriend(friend.id)}
                    />
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {friends.length < 2 ? (
            <div className="text-center text-sm text-muted-foreground p-4">
              You need at least 2 friends to create a group chat
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted"
                    onClick={() => setSelectedFriends(prev => [...prev, friend])}
                  >
                    <Avatar>
                      <AvatarImage src={friend.image ?? undefined} />
                      <AvatarFallback>
                        {friend.name?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{friend.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-muted-foreground">
              {selectedFriends.length} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGroup} 
                disabled={isCreateDisabled}
              >
                {isLoading ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 