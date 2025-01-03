import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Overview } from "@/components/dashboard/overview";

export const metadata: Metadata = {
  title: "Dashboard | TubePlus",
  description: "Manage your videos and playlists",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome back! Here's an overview of your activity."
      />
      <div className="grid gap-8">
        <Overview />
        <RecentActivity />
      </div>
    </DashboardShell>
  );
} 