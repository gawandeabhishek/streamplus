import { Metadata } from "next";
import { Suspense } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { VideoGrid } from "@/components/video/video-grid";
import { getYouTubeVideos } from "@/lib/youtube";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Explore | TubePlus",
  description: "Discover and watch videos together",
};

interface ExplorePageProps {
  searchParams: { q?: string };
}

async function ExploreContent({ searchParams }: ExplorePageProps) {
  const videos = await getYouTubeVideos(searchParams.q);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <Link 
          key={video.id} 
          href={`/watch/${video.id}`}
          className="group cursor-pointer"
        >
          <div className="aspect-video relative rounded-lg overflow-hidden mb-3">
            <Image
              src={video.thumbnail.url}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <h3 className="font-semibold truncate group-hover:text-primary">
            {video.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {video.channelTitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {video.viewCount} views
          </p>
        </Link>
      ))}
    </div>
  );
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Explore"
        text="Search and discover videos to watch together"
      />
      <div className="grid gap-6">
        <div className="max-w-2xl">
          <SearchInput />
        </div>
        <Suspense fallback={<VideoGrid videos={[]} isLoading />}>
          <ExploreContent searchParams={searchParams} />
        </Suspense>
      </div>
    </DashboardShell>
  );
} 