"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Logs,
  Map,
  MessageSquare,
  Radar,
  Settings,
  Users,
} from "lucide-react"
import { TeamSwitcher } from "./team-switcher"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  team: {
    name: "Field Force",
    logo: <Radar />,
    plan: "Field Team Management Made Simple",
  },
  navMain: [
    {
      title: "Dashboard",
      icon: <LayoutDashboard />,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Maps",
      icon: <Map />,
      items: [
        {
          title: "Maps",
          url: "/dashboard/maps",
        },
      ],
    },
    {
      title: "Tasks",
      icon: <Logs />,
      items: [
        {
          title: "Tasks",
          url: "/dashboard/tasks",
        },
      ],
    },
    {
      title: "Team",
      icon: <Users />,
      items: [
        {
          title: "Team",
          url: "/dashboard/team",
        },
      ],
    },
    {
      title: "Chats",
      icon: <MessageSquare />,
      items: [
        {
          title: "Chats",
          url: "/dashboard/chats",
        },
      ],
    },
    {
      title: "Settings",
      icon: <Settings />,
      items: [
        {
          title: "Settings",
          url: "/dashboard/settings",
        },
      ],
    },
  ],
  projects: [
    // {
    //   name: "Design Engineering",
    //   url: "#",
    //   icon: <FrameIcon />,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={data.team} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
