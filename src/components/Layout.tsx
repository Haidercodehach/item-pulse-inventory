
import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 py-8 px-6 md:px-10 lg:px-16 bg-background">
          <SidebarTrigger className="md:hidden mb-4" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
