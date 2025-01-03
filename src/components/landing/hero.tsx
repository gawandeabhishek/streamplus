"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Bring YouTube to Life – Learn, Share, Enjoy!
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Experience a smarter way to watch and share YouTube content with our
          enhanced platform. Create custom playlists, collaborate with friends, and
          discover new content.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" variant="gradient">
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#features">Watch Demo</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 