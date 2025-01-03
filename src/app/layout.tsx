import "@/app/globals.css";
import { Providers } from "./providers";
import { Inter } from "next/font/google";
import { PresenceProvider } from "@/components/providers/presence-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TubePlus",
  description: "Watch together, chat together",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <PresenceProvider>{children}</PresenceProvider>
        </Providers>
      </body>
    </html>
  );
}
