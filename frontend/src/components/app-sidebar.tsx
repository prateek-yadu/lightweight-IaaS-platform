import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LifeBuoyIcon,
  SendIcon,
  LayoutDashboard,
  Server,
  Store,
  CreditCard,
} from "lucide-react";
import Branding from "../branding.json";
import { Link } from "react-router";


const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [    
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      title: "VPS",
      url: "/dashboard/vps",
      icon: <Server />,
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: <CreditCard />,
    },
    {
      title: "Marketplace",
      url: "/dashboard/market",
      icon: <Store />,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "https://github.com/prateek-yadu/lightweight-IaaS-platform",
      icon: <LifeBuoyIcon />,
    },
    {
      title: "Feedback",
      url: "https://github.com/prateek-yadu/lightweight-IaaS-platform",
      icon: <SendIcon />,
    },
  ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const appName = Branding.AppName; // gets app name from @/src/branding.json
  const appVersion = Branding.AppVersion; // gets app name from @/src/branding.json

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center">
                <img src="/brandIcon.svg"/>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{appName}</span>
                <span className="truncate text-xs">{appVersion}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  );
}
