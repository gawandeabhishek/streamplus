"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function LikedVideosActions() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClearAll = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/youtube/liked/clear", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();
      
      toast.success("All videos unliked");
      router.refresh();
    } catch (error) {
      toast.error("Failed to unlike all videos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlike All Videos</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all videos from your Liked videos. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClearAll}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 