import { Metadata } from "next";
import { WatchTogetherButton } from "@/components/watch/watch-together-button";
import { VideoContainer } from "@/components/watch/video-container";

interface WatchPageProps {
  params: {
    videoId: string;
  };
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  return {
    title: `Watch | TubePlus`,
  };
}

export default function WatchPage({ params }: WatchPageProps) {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <WatchTogetherButton videoId={params.videoId} />
      </div>
      <VideoContainer videoId={params.videoId} />
    </div>
  );
} 