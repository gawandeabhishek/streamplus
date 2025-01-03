"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewChatDialog({ friends }: { friends: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const startConversation = async (id: string) => {
    if (loading) return;
    setLoading(id);
    
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      toast.success("Chat started!");
      setOpen(false);
      router.push(`/chat/${data.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to start chat");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="right" align="start">
        <Command>
          <CommandInput placeholder="Search friends..." />
          <CommandList>
            {friends.map((friend) => (
              <CommandItem
                key={friend.id}
                onSelect={() => startConversation(friend.id)}
                disabled={loading === friend.id}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.image || ""} />
                    <AvatarFallback>{friend.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{friend.name}</span>
                </div>
                {loading === friend.id && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </CommandItem>
            ))}
            {friends.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground text-center">
                No friends found
              </p>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 