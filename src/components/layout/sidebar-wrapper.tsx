"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Toggle Button */}
      {isMobile && !isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 hover:bg-accent/50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(isSidebarOpen || !isMobile) && (
          <>
            <motion.div
              initial={isMobile ? { x: -280 } : { x: 0 }}
              animate={{ x: 0 }}
              exit={isMobile ? { x: -280 } : { x: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className={cn(
                "fixed left-0 top-0 h-full w-[280px] z-40",
                "bg-background border-r",
                "lg:relative lg:block",
                "flex flex-col"
              )}
            >
              {/* Mobile Close Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="absolute top-4 right-4 hover:bg-accent/50"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto scrollbar-none">
                {children}
              </div>
            </motion.div>

            {/* Mobile Overlay */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-30"
              />
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
} 