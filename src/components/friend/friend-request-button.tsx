"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface FriendRequestButtonProps {
  friendId: string;
  initialStatus: "none" | "pending" | "received" | "accepted";
  onStatusChange?: (newStatus: string) => void;
}

export function FriendRequestButton({ 
  friendId, 
  initialStatus,
  onStatusChange 
}: FriendRequestButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateStatus = (newStatus: typeof status) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const handleRequest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) throw new Error();
      updateStatus("pending");
      toast({ description: "Friend request sent!" });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) throw new Error();
      updateStatus("accepted");
      toast({ description: "Friend request accepted!" });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/friends/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) throw new Error();
      updateStatus("none");
      toast({ description: "Friend removed!" });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonProps = {
    none: {
      text: "Add Friend",
      action: handleRequest,
      variant: "default" as const,
    },
    pending: {
      text: "Requested",
      action: () => {},
      variant: "secondary" as const,
    },
    received: {
      text: "Accept Request",
      action: handleAccept,
      variant: "default" as const,
    },
    accepted: {
      text: "Remove",
      action: handleRemove,
      variant: "destructive" as const,
    },
  };

  const { text, action, variant } = buttonProps[status];

  return (
    <Button 
      onClick={action} 
      disabled={isLoading || status === "pending"} 
      variant={variant}
      className="w-[120px]"
    >
      {isLoading ? "Loading..." : text}
    </Button>
  );
} 