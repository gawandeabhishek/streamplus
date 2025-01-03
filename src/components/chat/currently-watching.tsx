"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export function CurrentlyWatching() {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-medium">Currently Watching</h3>
      <Card className="overflow-hidden">
        <div className="relative aspect-video">
          <img 
            src="/gaming-stream.jpg" 
            alt="Active stream"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 text-white">
            <h4 className="font-medium">Active Video Stream</h4>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Users className="h-4 w-4" />
            <span>3 watching</span>
          </div>
          <Button className="w-full" variant="default">
            Join Stream
          </Button>
        </div>
      </Card>
    </div>
  );
} 