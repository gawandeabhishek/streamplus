"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Compass,
  Clock,
  ThumbsUp,
  ListVideo,
  MessageSquare,
  Users,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Explore",
    icon: Compass,
    href: "/explore",
  },
  {
    label: "Watch Later",
    icon: Clock,
    href: "/activity/watch-later",
  },
  {
    label: "Liked Videos",
    icon: ThumbsUp,
    href: "/activity/liked",
  },
  {
    label: "Playlists",
    icon: ListVideo,
    href: "/activity/playlists",
  },
  {
    label: "Chat",
    icon: MessageSquare,
    href: "/chat",
  },
  {
    label: "Friends",
    icon: Users,
    href: "/friends",
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-4">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          )}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}
    </nav>
  );
} 