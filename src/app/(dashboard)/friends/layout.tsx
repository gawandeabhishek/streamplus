import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Friends | TubePlus",
  description: "Manage your friends and watch together",
};

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 