"use client";

import { SessionProvider } from "next-auth/react";
import { PresenceProvider } from "@/components/providers/presence-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ session, children }: { session: any; children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider session={session}>
        <PresenceProvider>
          {children}
          <Toaster />
        </PresenceProvider>
      </SessionProvider>
    </ThemeProvider>
  );
} 