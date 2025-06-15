
import React from "react";
import { BarChart3, Package, Users, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile } = useAuth();

  return (
    <Sidebar className="min-h-screen">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="text-xl font-bold text-primary">Inventory Manager</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => navigate(item.href)}
                        className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-white"
                            : "hover:bg-muted/70 text-foreground"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 flex flex-col gap-2">
        <div className="text-sm text-muted-foreground mb-2">
          {profile?.full_name && (
            <span>
              <span className="font-semibold">{profile.full_name}</span>
              {"  "}
              <span className="text-xs text-muted-foreground">
                ({profile.role})
              </span>
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={async () => {
            await signOut();
            navigate("/auth");
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

