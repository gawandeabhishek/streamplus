"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, ThumbsUp, ListVideo, Users } from "lucide-react";

export function Overview() {
  const stats = [
    {
      name: "Videos Watched",
      value: "247",
      icon: Play,
      description: "videos this month",
    },
    {
      name: "Liked Videos",
      value: "89",
      icon: ThumbsUp,
      description: "total liked videos",
    },
    {
      name: "Playlists",
      value: "12",
      icon: ListVideo,
      description: "created playlists",
    },
    {
      name: "Friends",
      value: "23",
      icon: Users,
      description: "watching together",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.name}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 