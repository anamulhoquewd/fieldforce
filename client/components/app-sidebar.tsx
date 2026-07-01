"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { WorkerNav } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUser } from "@/context/authContext"
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

type User = {
  name: string
  email: string
  avatar: string
}

type Team = {
  name: string
  logo: React.ReactNode
  plan: string
}

type NavItem = {
  title: string
  icon: React.ReactNode
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

type Project = {
  name: string
  url: string
  icon: React.ReactNode
}

const data: {
  user: User
  team: Team
  navMain: NavItem[]
  projects: Project[]
} = {
  user: {
    name: "FieldForce",
    email: "user@fieldforce.com",
    avatar: "",
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
          title: "Overview",
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
  projects: [],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  main?: typeof data.navMain
  projects?: typeof data.projects
}

export function AppSidebar({ main, projects, ...props }: AppSidebarProps) {
  const { user } = useUser()
  const modifiedData = {
    ...data,
    navMain: main || data.navMain,
    projects: projects || data.projects,
    user: {
      ...data.user,
      name: user?.name || data.user.name,
      email: user?.email || data.user.email,
    },
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={modifiedData.team} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={modifiedData.navMain} />
        <WorkerNav projects={modifiedData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={modifiedData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
