import { Metadata } from "next";
import { CopyButton } from "@/components/video/copy-button";

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

export default async function WatchPage({ params }: WatchPageProps) {
  return (
    <div className="h-screen w-screen bg-black relative">
      <CopyButton videoId={params.videoId} />
      <iframe
        src={`https://www.youtube.com/embed/${params.videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&disablekb=1&iv_load_policy=3&autoplay=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
} 