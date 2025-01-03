"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { FriendsList } from "@/components/friends/friends-list";
import { FriendRequests } from "@/components/friends/friend-requests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendRequestsBadge } from "@/components/layout/friend-requests-badge";
import { useState } from "react";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("friends");

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Friends"
        description="Connect with friends and watch together"
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Friend Requests
            <span className="absolute -top-1 -right-1">
              <FriendRequestsBadge />
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="friends" className="space-y-4">
          <FriendsList />
        </TabsContent>
        <TabsContent value="requests" className="space-y-4">
          <FriendRequests />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
} 