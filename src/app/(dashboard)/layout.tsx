import { DashboardNav } from "@/components/layout/dashboard-nav";
import { UserNav } from "@/components/layout/user-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-sidebar-background flex flex-col fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold">TubePlus</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DashboardNav />
        </div>
        <div className="p-4 border-t">
          <UserNav />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto ml-64">
        {children}
      </div>
    </div>
  );
} 