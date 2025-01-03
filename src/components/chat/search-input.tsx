"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput() {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search messages..."
        className="pl-8 bg-accent/10 focus-visible:ring-1 focus-visible:ring-offset-0"
      />
    </div>
  );
} 