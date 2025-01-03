"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Tags, Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Filter {
  id: string;
  name: string;
}

export function ChatFilters({ onFilterChange }: { onFilterChange: (filter: string) => void }) {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [newFilter, setNewFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const createFilter = async () => {
    if (!newFilter.trim()) return;

    try {
      const response = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFilter }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setFilters([...filters, data]);
      setNewFilter("");
      setIsOpen(false);
      toast.success("Filter created successfully");
    } catch (error) {
      toast.error("Failed to create filter");
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange("messages")}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Messages
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange("groups")}
      >
        <Users className="h-4 w-4 mr-2" />
        Groups
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Tags className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {filters.map((filter) => (
            <DropdownMenuItem
              key={filter.id}
              onClick={() => onFilterChange(filter.name)}
            >
              {filter.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Filter
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Filter name..."
              value={newFilter}
              onChange={(e) => setNewFilter(e.target.value)}
            />
            <Button onClick={createFilter}>Create Filter</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 