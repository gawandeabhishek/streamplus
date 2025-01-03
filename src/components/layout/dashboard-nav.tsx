"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Compass, 
  Clock, 
  ThumbsUp, 
  List, 
  MessageSquare, 
  Users 
} from "lucide-react";

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: Clock, label: 'Watch Later', href: '/activity/watch-later' },
  { icon: ThumbsUp, label: 'Liked Videos', href: '/activity/liked' },
  { icon: List, label: 'Playlists', href: '/activity/playlists' },
  { icon: MessageSquare, label: 'Chat', href: '/chat' },
  { icon: Users, label: 'Friends', href: '/friends' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 p-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            "text-sm font-medium rounded-xl transition-all",
            "hover:bg-accent/80 hover:text-accent-foreground",
            pathname === item.href 
              ? "bg-accent text-accent-foreground shadow-sm" 
              : "text-muted-foreground"
          )}
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
} 