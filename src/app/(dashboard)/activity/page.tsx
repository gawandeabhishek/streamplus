import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Playlists } from "@/components/activity/playlists";
import { LikedVideos } from "@/components/activity/liked-videos";
import { WatchLater } from "@/components/activity/watch-later";
import { History } from "@/components/activity/history";

export const metadata: Metadata = {
  title: "Your Activity | TubePlus",
  description: "View your playlists and video history",
};

export default function ActivityPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Activity</h1>
      <Tabs defaultValue="playlists">
        <TabsList>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="liked">Liked Videos</TabsTrigger>
          <TabsTrigger value="watchLater">Watch Later</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="playlists">
          <Playlists />
        </TabsContent>
        <TabsContent value="liked">
          <LikedVideos />
        </TabsContent>
        <TabsContent value="watchLater">
          <WatchLater />
        </TabsContent>
        <TabsContent value="history">
          <History />
        </TabsContent>
      </Tabs>
    </div>
  );
} 