import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-vibrant">
        <AppSidebar />
        <main className="flex-1 py-8 px-3 md:px-6 lg:px-8 bg-transparent">
          <SidebarTrigger className="md:hidden mb-4" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
