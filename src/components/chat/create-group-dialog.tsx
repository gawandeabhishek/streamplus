"use client";

import { useState, useMemo } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Use useMemo for filtered friends
  const filteredFriends = useMemo(() => {
    return friends.filter(friend => 
      friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedFriends.some(selected => selected.id === friend.id)
    );
  }, [friends, searchQuery, selectedFriends]);

  const isCreateDisabled = 
    isLoading || 
    !groupName.trim() || 
    selectedFriends.length < 2 || 
    friends.length < 2;

  const handleRemoveFriend = (friendId: string) => {
    setSelectedFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriends(prev => [...prev, friend]);
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

  const handleClose = () => {
    setOpen(false);
    setGroupName("");
    setSearchQuery("");
    setSelectedFriends([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
                    onClick={() => handleSelectFriend(friend)}
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
              <Button variant="outline" onClick={handleClose}>
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