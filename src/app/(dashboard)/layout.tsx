"use client";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import { UserNav } from "@/components/layout/user-nav";
import { useState, useEffect } from "react";
import { motion, PanInfo, AnimatePresence, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const dragControls = useDragControls();

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setIsSidebarOpen(!isMobileView);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDrag = (event: any, info: PanInfo) => {
    if (isMobile) {
      const shouldOpen = info.offset.x > 50;
      setIsSidebarOpen(shouldOpen);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Container */}
      <AnimatePresence mode="wait">
        <motion.aside
          initial={false}
          animate={{ x: (!isMobile || isSidebarOpen) ? 0 : -240 }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          drag={isMobile ? "x" : false}
          dragControls={dragControls}
          dragConstraints={{ left: -240, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDrag}
          className={cn(
            "w-60 bg-background",
            "fixed md:static left-0 top-0 bottom-0",
            "flex flex-col",
            "z-50",
            "border-r"
          )}
        >
          {/* Sidebar Content - Reduced padding */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">TubePlus</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DashboardNav />
          </div>
          <div className="border-t">
            <UserNav />
          </div>

          {/* Handle - Only show on mobile */}
          {isMobile && (
            <div 
              onPointerDown={(e) => {
                e.preventDefault();
                dragControls.start(e);
              }}
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 translate-x-full",
                "w-1.5 h-20 bg-accent rounded-r-full",
                "cursor-grab active:cursor-grabbing"
              )} 
            />
          )}
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black md:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
} 