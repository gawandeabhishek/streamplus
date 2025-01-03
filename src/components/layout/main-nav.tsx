"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";

export function MainNav() {
  const { data: session } = useSession();

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-2xl">
          TubePlus
        </Link>
        
        <nav className="flex items-center gap-6">
          {session ? (
            <>
              <Link href="/explore">Explore</Link>
              <Link href="/activity">Activity</Link>
              <Link href="/chat">Chat</Link>
              <UserNav />
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
} 