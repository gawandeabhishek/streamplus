"use client";

import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface StreamActionsProps {
  videoId: string;
}

export function StreamActions({ videoId }: StreamActionsProps) {
  return (
    <Button variant="outline" size="sm">
      <Users className="h-4 w-4 mr-2" />
      Watch Together
    </Button>
  );
} 