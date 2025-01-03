import { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { ChatContainer } from "@/components/chat/chat-container";

export const metadata: Metadata = {
  title: "Chat | TubePlus",
  description: "Chat with your friends",
};

export default function ChatPage() {
  return (
    <DashboardShell>
      {/* <DashboardHeader
        heading="Chat"
        description="Chat with your friends"
      /> */}
      <ChatContainer />
    </DashboardShell>
  );
} 