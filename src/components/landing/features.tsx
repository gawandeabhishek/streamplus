"use client";

import { motion } from "framer-motion";

export function Features() {
  const features = [
    {
      title: "Quick Video Sharing",
      description: "Share your favorite moments instantly with timestamps and custom notes."
    },
    {
      title: "Group Watching",
      description: "Watch together in real-time with friends and family, no matter where they are."
    },
    {
      title: "Smart Playlists",
      description: "Create and organize playlists with AI-powered recommendations."
    }
  ];

  return (
    <section className="py-16">
      <div className="container">
        <h2 className="text-3xl font-bold text-center">Why Everyone Loves Our Platform</h2>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="p-6 rounded-lg border"
            >
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 